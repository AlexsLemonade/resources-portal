import copy
import uuid

from django.db import models
from django.forms.models import model_to_dict
from rest_framework import serializers, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from guardian.shortcuts import get_objects_for_user

from resources_portal.models import (
    MaterialRequest,
    MaterialShareEvent,
    Notification,
    Organization,
    User,
)
from resources_portal.notifier import send_notifications
from resources_portal.serializers import (
    AddressRelationSerializer,
    AttachmentRelationSerializer,
    FulfillmentNoteRelationSerializer,
    MaterialRequestIssueRelationSerializer,
    UserRelationSerializer,
)
from resources_portal.serializers.material import MaterialDetailSerializer

SHARER_MODIFIABLE_FIELDS = {"status", "executed_mta_attachment"}

REQUESTER_MODIFIABLE_FIELDS = {"irb_attachment", "requester_signed_mta_attachment", "status"}


class MaterialRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequest
        fields = (
            "id",
            "is_active_requester",
            "is_active_sharer",
            "rejection_reason",
            "status",
            "payment_method",
            "payment_method_notes",
            "requester_abstract",
            "assigned_to",
            "has_issues",
            "issues",
            "is_one_month_old",
            "is_missing_requester_documents",
            "requires_action_sharer",
            "requires_action_requester",
            "executed_mta_attachment",
            "irb_attachment",
            "material",
            "requester",
            "requester_signed_mta_attachment",
            "fulfillment_notes",
            "address",
            "human_readable_created_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "issues",
            "fulfillment_notes",
            "created_at",
            "updated_at",
            "requester",
        )


class MaterialRequestDetailSerializer(MaterialRequestSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    requester = UserRelationSerializer()
    material = MaterialDetailSerializer()
    issues = MaterialRequestIssueRelationSerializer(many=True, read_only=True)
    fulfillment_notes = FulfillmentNoteRelationSerializer(many=True, read_only=True)
    address = AddressRelationSerializer()
    executed_mta_attachment = AttachmentRelationSerializer()
    irb_attachment = AttachmentRelationSerializer()
    requester_signed_mta_attachment = AttachmentRelationSerializer()


class CanViewRequestsOrIsRequester(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user.has_perm("view_requests", obj.material.organization)
            or request.user == obj.requester
        )


class CanApproveRequestsOrIsRequester(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user.has_perm("approve_requests", obj.material.organization)
            or request.user == obj.requester
            or request.user == obj.assigned_to
        )


class IsModifyingPermittedFields(BasePermission):
    """Certain changes cannot be made by either party at various times."""

    def has_object_permission(self, request, view, obj):
        # First, check status since it's the most complicated:
        if "status" in request.data and request.data["status"] != getattr(obj, "status"):
            if request.user == obj.requester:
                if request.data["status"] not in [
                    "CANCELLED",
                    "IN_FULFILLMENT",
                    "VERIFIED_FULFILLED",
                ]:
                    return False
                # Requester can only move to IN_FULFILLMENT if no MTA
                # is required and other requirements are provided.
                elif request.data["status"] == "IN_FULFILLMENT" and (
                    obj.status != "APPROVED"
                    or obj.material.needs_mta
                    or obj.get_is_missing_requester_documents(
                        irb_attachment=request.data.get("irb_attachment", None),
                        address=request.data.get("address", None),
                        payment_method=request.data.get("payment_method", None),
                    )
                ):
                    return False
                # Can only verify a fulfilled request.
                elif request.data["status"] == "VERIFIED_FULFILLED" and obj.status != "FULFILLED":
                    return False
            else:
                # The sharer can pretty much do anything but cancel or verify a request.
                if request.data["status"] in ["CANCELLED", "VERIFIED_FULFILLED"]:
                    return False

        if request.user == obj.requester:
            forbidden_fields = [
                "is_active_sharer",
                "is_active_requester",
                "assigned_to",
                "rejection_reason",
                "requires_action_sharer",
                "requires_action_requester",
                "executed_mta_attachment",
                "material",
                "requester",
            ]

            # If the request is apporoved, the requester can't change
            # these any longer.  If they really need to, they'll need to
            # cancel and resubmit so the sharer can reevaluate whether or
            # not to approve the request.
            if obj.status != "OPEN":
                forbidden_fields += ["requester_abstract"]
        else:
            # The sharer can modify most of the fields the requester
            # can't. This way the requester cannot modify details of
            # the request post-approval, but the sharer can update
            # those fields for the requester if necessary.
            forbidden_fields = [
                "is_active_sharer",
                "is_active_requester",
                "payment_method",
                "payment_method_notes",
                "has_issues",
                "requires_action_sharer",
                "requires_action_requester",
                "material",
            ]

        for field in forbidden_fields:
            if field in request.data:
                attribute = getattr(obj, field)
                if isinstance(attribute, models.Model):
                    # UUID's can't just be treated as strings for some reason...
                    database_pk = (
                        str(attribute.id) if isinstance(attribute.id, uuid.UUID) else attribute.id
                    )
                    if isinstance(request.data[field], dict):
                        request_pk = request.data[field]["id"]
                    else:
                        request_pk = request.data[field]

                    if request_pk != database_pk:
                        return False
                elif request.data[field] != attribute:
                    return False

        return True


def send_material_request_notif(notif_type, request, notified_user):
    notification = Notification(
        notification_type=notif_type,
        notified_user=notified_user,
        associated_user=request.assigned_to,
        material=request.material,
        organization=request.material.organization,
    )
    notification.save()


def notify_requester(notification_type, request):
    send_notifications(
        notification_type,
        request.requester,
        request.requester,
        request.material.organization,
        material=request.material,
        material_request=request,
    )


def notify_sharer(notification_type, request):
    send_notifications(
        notification_type,
        request.assigned_to,
        request.assigned_to,
        request.material.organization,
        material=request.material,
        material_request=request,
    )


def notify_request_status_change(request):
    if request.status == "APPROVED":
        notify_requester("MATERIAL_REQUEST_REQUESTER_ACCEPTED", request)
        notify_sharer("MATERIAL_REQUEST_SHARER_APPROVED", request)
    elif request.status == "REJECTED":
        notify_requester("MATERIAL_REQUEST_REQUESTER_REJECTED", request)
        notify_sharer("MATERIAL_REQUEST_SHARER_REJECTED", request)
    elif request.status == "CANCELLED":
        notify_requester("MATERIAL_REQUEST_REQUESTER_CANCELLED", request)
        notify_sharer("MATERIAL_REQUEST_SHARER_CANCELLED", request)
    elif request.status == "FULFILLED":
        notify_requester("MATERIAL_REQUEST_REQUESTER_FULFILLED", request)
        notify_sharer("MATERIAL_REQUEST_SHARER_FULFILLED", request)
    elif request.status == "IN_FULFILLMENT":
        if request.executed_mta_attachment:
            notify_sharer("MATERIAL_REQUEST_SHARER_EXECUTED_MTA", request)
            notify_requester("MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA", request)
        else:
            notify_sharer("MATERIAL_REQUEST_SHARER_IN_FULFILLMENT", request)
            notify_requester("MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT", request)
    elif request.status == "VERIFIED_FULFILLED":
        notify_sharer("MATERIAL_REQUEST_SHARER_VERIFIED", request)
    else:
        return


def user_in_attachment_org(attachment, user):
    if attachment.owned_by_org:
        return user in attachment.owned_by_org.members.all()
    else:
        return False


def field_changed(field_name, old_material_request, new_material_request):
    new_value = getattr(new_material_request, field_name)
    old_value = getattr(old_material_request, field_name)
    return new_value != old_value


def add_attachment_to_material_request(material_request, attachment, attachment_type, user):
    """"Adds an attachment to a material request.

    Checks that the current user is in the org that uploaded the
    attachment.
    """
    if not (user_in_attachment_org(attachment, user) or attachment.owned_by_user == user):
        raise PermissionDenied(
            detail=f"The current user is not authorized for the specified attachment of type {attachment_type}."
        )

    setattr(material_request, attachment_type, attachment)
    material_request.save()

    attachment.material_request = material_request

    # Assign ownership of the attachment to the other party in the material request
    if material_request.requester == user:
        attachment.owned_by_org = material_request.material.organization
    else:
        attachment.owned_by_user = material_request.requester

    attachment.save()


class MaterialRequestViewSet(viewsets.ModelViewSet):
    filterset_fields = (
        "id",
        "status",
        "requester__id",
        "assigned_to__id",
        "is_active_requester",
        "is_active_sharer",
    )

    def get_queryset(self):
        if self.action == "list":
            material_requests = MaterialRequest.objects

            # If the route is nested under material it should be filtered by that material.
            if "material_id" in self.request.parser_context["kwargs"]:
                material_requests = material_requests.filter(
                    material__id=self.request.parser_context["kwargs"]["material_id"]
                )

            requests_made_by_user = material_requests.filter(requester=self.request.user)
            organizations = get_objects_for_user(
                self.request.user, "view_requests", klass=Organization.objects
            )
            requests_viewable_by_user = material_requests.filter(
                material__organization__in=organizations
            )

            queryset = (requests_made_by_user | requests_viewable_by_user).distinct()
        else:
            queryset = MaterialRequest.objects.all()

        return queryset.order_by("-created_at")

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return MaterialRequestSerializer

        return MaterialRequestDetailSerializer

    def get_permissions(self):
        if self.action == "retrieve":
            permission_classes = [IsAuthenticated, CanViewRequestsOrIsRequester]
        elif self.action == "update" or self.action == "partial_update":
            permission_classes = [
                IsAuthenticated,
                CanApproveRequestsOrIsRequester,
                IsModifyingPermittedFields,
            ]
        elif self.action == "destroy":
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [
                IsAuthenticated,
            ]

        return [permission() for permission in permission_classes]

    # Determines what the next requirement(s) are for the material request.
    # Returns a list of the next requirements, which is null if there are none left
    def get_material_requirements(self):
        request = self.get_object()
        material = request.material

        requirements_list = []

        if request.status == "OPEN":
            requirements_list.append("NEEDS_TO_BE_APPROVED")

        if material.needs_mta and not request.requester_signed_mta_attachment:
            requirements_list.append("NEEDS_MTA_TO_BE_SIGNED")

        if material.needs_mta and not request.executed_mta_attachment:
            requirements_list.append("NEEDS_MTA_TO_BE_SIGNED")

        if material.needs_irb and not request.irb_attachment:
            requirements_list.append("NEEDS_IRB")

        return requirements_list

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(data=request.data)
        serializer.is_valid(raise_exception=True)

        material = serializer.validated_data["material"]

        # Make sure assigned_to is always contact user initially.
        serializer.validated_data["assigned_to"] = material.contact_user

        if material.is_archived:
            return Response(data={"reason": "Cannot request archived materials."}, status=400)

        serializer.validated_data["requester"] = request.user

        material_request = MaterialRequest(**serializer.validated_data)
        material_request.save()

        notify_sharer("MATERIAL_REQUEST_SHARER_ASSIGNED_NEW", material_request)
        notify_sharer("MATERIAL_REQUEST_SHARER_RECEIVED", material_request)

        MaterialShareEvent(
            event_type="REQUEST_OPENED",
            material=material,
            material_request=material_request,
            created_by=request.user,
            assigned_to=material_request.assigned_to,
        ).save()

        return Response(data=model_to_dict(material_request), status=201)

    def create_notifications(self, request, old_material_request, new_material_request):
        if field_changed("status", old_material_request, new_material_request):
            notify_request_status_change(new_material_request)

        if request.user == new_material_request.requester:
            if field_changed(
                "requester_signed_mta_attachment", old_material_request, new_material_request
            ):
                notify_sharer("MATERIAL_REQUEST_SHARER_RECEIVED_MTA", new_material_request)
            elif (
                field_changed("payment_method", old_material_request, new_material_request)
                or field_changed("payment_method_notes", old_material_request, new_material_request)
                or field_changed("address", old_material_request, new_material_request)
                or field_changed("irb_attachment", old_material_request, new_material_request)
            ):
                notify_sharer("MATERIAL_REQUEST_SHARER_RECEIVED_INFO", new_material_request)

        else:
            if field_changed("executed_mta_attachment", old_material_request, new_material_request):
                notify_requester("MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA", new_material_request)
                notify_sharer("MATERIAL_REQUEST_SHARER_EXECUTED_MTA", new_material_request)

            if field_changed("assigned_to", old_material_request, new_material_request):
                notify_sharer("MATERIAL_REQUEST_SHARER_ASSIGNED", new_material_request)
                notify_sharer("MATERIAL_REQUEST_SHARER_ASSIGNMENT", new_material_request)

    def create_events(self, request, old_material_request, new_material_request):
        material = old_material_request.material

        def create_event(event_type, material, created_by, assigned_to):
            MaterialShareEvent(
                event_type=event_type,
                material=material,
                material_request=new_material_request,
                created_by=created_by,
                assigned_to=assigned_to,
            ).save()

        if field_changed("assigned_to", old_material_request, new_material_request):
            create_event(
                "REQUEST_REASSIGNED", material, request.user, new_material_request.assigned_to
            )

        if field_changed("status", old_material_request, new_material_request):
            event_type = "REQUEST_" + new_material_request.status
            create_event(event_type, material, request.user, new_material_request.assigned_to)

        if field_changed("irb_attachment", old_material_request, new_material_request):
            create_event(
                "REQUESTER_IRB_ADDED", material, request.user, new_material_request.assigned_to
            )

        if field_changed(
            "requester_signed_mta_attachment", old_material_request, new_material_request
        ):
            create_event(
                "REQUESTER_MTA_ADDED", material, request.user, new_material_request.assigned_to
            )

        if field_changed("payment_method", old_material_request, new_material_request):
            create_event(
                "REQUESTER_PAYMENT_METHOD_ADDED",
                material,
                request.user,
                new_material_request.assigned_to,
            )

        if field_changed("payment_method_notes", old_material_request, new_material_request):
            create_event(
                "REQUESTER_PAYMENT_METHOD_NOTES_ADDED",
                material,
                request.user,
                new_material_request.assigned_to,
            )

        if field_changed("executed_mta_attachment", old_material_request, new_material_request):
            create_event(
                "SHARER_MTA_ADDED", material, request.user, new_material_request.assigned_to
            )

    def update(self, request, *args, **kwargs):
        material_request = self.get_object()
        original_material_request = copy.deepcopy(material_request)

        serializer = self.get_serializer_class()(material_request, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        serializer.save()
        material_request.refresh_from_db()

        if request.user == material_request.requester:
            irb_changed = field_changed(
                "irb_attachment", original_material_request, material_request
            )
            mta_changed = field_changed(
                "requester_signed_mta_attachment", original_material_request, material_request
            )

            # Don't allow piecemeal uploads of required documents
            # because they make determining the state of the request
            # difficult. If someone is uploading docs, they need to
            # upload everything at once.
            if irb_changed or mta_changed:
                missing_document = False
                if original_material_request.material.needs_irb and not irb_changed:
                    missing_document = True
                if original_material_request.material.needs_mta and not mta_changed:
                    missing_document = True

                if missing_document:
                    return Response(
                        data={"reason": "The material request requires an additional document."},
                        status=400,
                    )

            if irb_changed:
                add_attachment_to_material_request(
                    material_request,
                    serializer.validated_data["irb_attachment"],
                    "irb_attachment",
                    request.user,
                )

            if mta_changed:
                add_attachment_to_material_request(
                    material_request,
                    serializer.validated_data["requester_signed_mta_attachment"],
                    "requester_signed_mta_attachment",
                    request.user,
                )
        else:
            if field_changed(
                "executed_mta_attachment", original_material_request, material_request
            ):
                add_attachment_to_material_request(
                    material_request,
                    serializer.validated_data["executed_mta_attachment"],
                    "executed_mta_attachment",
                    request.user,
                )

            if "status" in request.data:
                if (
                    serializer.validated_data["status"] == "FULFILLED"
                    and material_request.has_issues
                ):
                    for issue in material_request.issues.filter(status="OPEN"):
                        issue.status = "CLOSED"
                        issue.save()

                        MaterialShareEvent(
                            event_type="REQUEST_ISSUE_CLOSED",
                            material=material_request.material,
                            material_request=material_request,
                            created_by=request.user,
                            assigned_to=material_request.assigned_to,
                        ).save()

        self.create_notifications(request, original_material_request, material_request)
        self.create_events(request, original_material_request, material_request)

        response_data = model_to_dict(material_request)
        response_data = MaterialRequestDetailSerializer(material_request).data
        response_data["requirements"] = self.get_material_requirements()

        return Response(data=response_data, status=200)
