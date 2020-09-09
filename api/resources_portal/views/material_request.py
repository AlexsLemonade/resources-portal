from django.forms.models import model_to_dict
from rest_framework import serializers, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from guardian.shortcuts import get_objects_for_user

from resources_portal.models import Address, MaterialRequest, Notification, Organization, User
from resources_portal.notifier import send_notifications
from resources_portal.views.relation_serializers import (
    AttachmentRelationSerializer,
    FulfillmentNoteRelationSerializer,
    MaterialRelationSerializer,
    MaterialRequestIssueRelationSerializer,
    UserRelationSerializer,
)

SHARER_MODIFIABLE_FIELDS = {"status", "executed_mta_attachment"}

REQUESTER_MODIFIABLE_FIELDS = {"irb_attachment", "requester_signed_mta_attachment", "status"}


class MaterialRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequest
        fields = (
            "id",
            "is_active",
            "rejection_reason",
            "status",
            "payment_method",
            "payment_method_notes",
            "requester_abstract",
            "assigned_to",
            "has_issues",
            "issues",
            "requires_action_sharer",
            "requires_action_requester",
            "executed_mta_attachment",
            "irb_attachment",
            "material",
            "requester",
            "requester_signed_mta_attachment",
            "fulfillment_notes",
            "address",
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
    material = MaterialRelationSerializer()
    issues = MaterialRequestIssueRelationSerializer(many=True, read_only=True)
    fulfillment_notes = FulfillmentNoteRelationSerializer(many=True, read_only=True)
    address = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all())
    executed_mta_attachment = AttachmentRelationSerializer()
    irb_attachment = AttachmentRelationSerializer()
    requester_signed_mta_attachment = AttachmentRelationSerializer()


class IsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser


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


def notify_request_status_change(status, request):
    if status == "APPROVED":
        notify_requester("MATERIAL_REQUEST_REQUESTER_ACCEPTED", request)
        notify_sharer("MATERIAL_REQUEST_SHARER_APPROVED", request)
    elif status == "REJECTED":
        notify_requester("MATERIAL_REQUEST_REQUESTER_REJECTED", request)
        notify_sharer("MATERIAL_REQUEST_SHARER_REJECTED", request)
    elif status == "CANCELLED":
        notify_requester("MATERIAL_REQUEST_REQUESTER_CANCELLED", request)
        notify_sharer("MATERIAL_REQUEST_SHARER_CANCELLED", request)
    elif status == "FULFILLED":
        notify_requester("MATERIAL_REQUEST_REQUESTER_FULFILLED", request)
        notify_sharer("MATERIAL_REQUEST_SHARER_FULFILLED", request)
    elif status == "IN_FULFILLMENT":
        if request.executed_mta_attachment:
            notify_requester("MATERIAL_REQUEST_SHARER_EXECUTED_MTA", request)
            notify_requester("MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA", request)
        else:
            notify_requester("MATERIAL_REQUEST_SHARER_IN_FULFILLMENT", request)
            notify_requester("MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT", request)
    elif status == "VERIFIED_FULFILLED":
        notify_sharer("MATERIAL_REQUEST_SHARER_VERIFIED", request)
    else:
        return


def user_in_attachment_org(attachment, user):
    if attachment.owned_by_org:
        return user in attachment.owned_by_org.members.all()
    else:
        return False


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

            queryset = requests_made_by_user.union(requests_viewable_by_user)
        else:
            queryset = MaterialRequest.objects.all()

        return queryset.order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "list":
            return MaterialRequestSerializer

        return MaterialRequestDetailSerializer

    def get_permissions(self):
        if self.action == "retrieve":
            permission_classes = [IsAuthenticated, CanViewRequestsOrIsRequester]
        elif self.action == "update" or self.action == "partial-update":
            permission_classes = [IsAuthenticated, CanApproveRequestsOrIsRequester]
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
        serializer = MaterialRequestSerializer(data=request.data)
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

        return Response(data=model_to_dict(material_request), status=201)

    def update(self, request, *args, **kwargs):
        material_request = self.get_object()

        if material_request.status in ["REJECTED", "CANCELLED", "VERIFIED_FULFILLED"]:
            return Response(status=403)

        serializer = MaterialRequestSerializer(material_request, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if request.user == material_request.requester:
            if (
                "irb_attachment" in request.data
                and serializer.validated_data["irb_attachment"] != material_request.irb_attachment
            ):
                add_attachment_to_material_request(
                    material_request,
                    serializer.validated_data["irb_attachment"],
                    "irb_attachment",
                    request.user,
                )

            if (
                "requester_signed_mta_attachment" in request.data
                and serializer.validated_data["requester_signed_mta_attachment"]
                != material_request.requester_signed_mta_attachment
            ):
                add_attachment_to_material_request(
                    material_request,
                    serializer.validated_data["requester_signed_mta_attachment"],
                    "requester_signed_mta_attachment",
                    request.user,
                )

                notify_sharer("MATERIAL_REQUEST_SHARER_RECEIVED_MTA", material_request)

            if "status" in request.data and request.data["status"] != material_request.status:
                # The only status change the requester can make is to
                # cancel or verify the request.
                cancelling = serializer.validated_data["status"] == "CANCELLED"
                verifying = (
                    material_request.status == "FULFILLED"
                    and serializer.validated_data["status"] == "VERIFIED_FULFILLED"
                )
                if not (cancelling or verifying):
                    return Response(status=403)

                notify_request_status_change(serializer.validated_data["status"], material_request)

            # Can't make it read-only because organization members
            # should be able to change it.
            if (
                "assigned_to" in request.data
                and serializer.validated_data["assigned_to"] != material_request.assigned_to
            ):
                return Response(status=403)

        else:
            if (
                "executed_mta_attachment" in request.data
                and serializer.validated_data["executed_mta_attachment"]
                != material_request.executed_mta_attachment
            ):
                add_attachment_to_material_request(
                    material_request,
                    serializer.validated_data["executed_mta_attachment"],
                    "executed_mta_attachment",
                    request.user,
                )

                notify_requester("MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA", material_request)

            if "status" in request.data:
                if serializer.validated_data["status"] in ["CANCELLED", "VERIFIED_FULFILLED"]:
                    return Response(status=403)

                if (
                    serializer.validated_data["status"] == "FULFILLED"
                    and material_request.has_issues
                ):
                    for issue in material_request.issues.filter(status="OPEN"):
                        issue.status = "CLOSED"
                        issue.save()

                notify_request_status_change(serializer.validated_data["status"], material_request)

        serializer.save()
        material_request.refresh_from_db()

        response_data = model_to_dict(material_request)
        response_data = MaterialRequestDetailSerializer(material_request).data
        response_data["requirements"] = self.get_material_requirements()

        return Response(data=response_data, status=200)
