from django.forms.models import model_to_dict
from rest_framework import serializers, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from resources_portal.models import MaterialRequest, Notification
from resources_portal.views.relation_serializers import (
    AttachmentRelationSerializer,
    MaterialRelationSerializer,
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
            "status",
            "assigned_to",
            "executed_mta_attachment",
            "irb_attachment",
            "material",
            "requester",
            "requester_signed_mta_attachment",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "assigned_to",
            "requester",
        )


class MaterialRequestDetailSerializer(MaterialRequestSerializer):
    assigned_to = UserRelationSerializer()
    requester = UserRelationSerializer()
    material = MaterialRelationSerializer()
    executed_mta_attachment = AttachmentRelationSerializer()
    irb_attachment = AttachmentRelationSerializer()
    requester_signed_mta_attachment = AttachmentRelationSerializer()


class IsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser


class CanViewRequests(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("view_requests", obj.material.organization)


class CanViewRequestsOrIsRequester(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user.has_perm("view_requests", obj.material.organization)
            or request.user == obj.requester
        )


class CanApproveRequests(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("approve_requests", obj.material.organization)


class CanApproveRequestsOrIsRequester(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user.has_perm("approve_requests", obj.material.organization)
            or request.user == obj.requester
        )


def send_material_request_notif(notif_type, request, notified_user):
    notification = Notification(
        notification_type=notif_type,
        notified_user=notified_user,
        associated_user=request.assigned_to,
        associated_material=request.material,
        associated_organization=request.material.organization,
    )
    notification.save()


def send_transfer_update_notif(status, request):
    if status == "APPROVED":
        send_material_request_notif("TRANSFER_APPROVED", request, request.requester)
    elif status == "REJECTED":
        send_material_request_notif("TRANSFER_REJECTED", request, request.requester)
    elif status == "FULFILLED":
        send_material_request_notif("TRANSFER_FULFILLED", request, request.requester)
    else:
        return


def user_in_attachment_org(attachment, user):
    if attachment.owned_by_org:
        return user in attachment.owned_by_org.members.all()
    else:
        return False


# Adds an attachment to a material request, checking that the current user is in the org that uploaded the attachment.
def add_attachment_to_material_request(material_request, attachment, attachment_type, user):
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
    queryset = MaterialRequest.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return MaterialRequestSerializer

        return MaterialRequestDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [
                IsAuthenticated,
                CanViewRequests,
            ]
        elif self.action == "retrieve":
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

        if request.status == "PENDING":
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

        serializer.validated_data["requester"] = request.user

        material_request = MaterialRequest(**serializer.validated_data)
        material_request.save()

        notification = Notification(
            notification_type="TRANSFER_REQUESTED",
            notified_user=material_request.assigned_to,
            associated_user=request.user,
            associated_material=material,
            associated_organization=material.organization,
        )
        notification.save()

        return Response(data=model_to_dict(material_request), status=201)

    def update(self, request, *args, **kwargs):
        material_request = self.get_object()

        if material_request.status in ["REJECTED", "CANCELLED", "FULFILLED"]:
            return Response(status=403)

        serializer = MaterialRequestSerializer(material_request, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if request.user == material_request.requester:
            if "irb_attachment" in request.data:
                add_attachment_to_material_request(
                    material_request,
                    serializer.validated_data["irb_attachment"],
                    "irb_attachment",
                    request.user,
                )

            if "requester_signed_mta_attachment" in request.data:
                add_attachment_to_material_request(
                    material_request,
                    serializer.validated_data["requester_signed_mta_attachment"],
                    "requester_signed_mta_attachment",
                    request.user,
                )

                send_material_request_notif(
                    "SIGNED_MTA_UPLOADED", material_request, material_request.assigned_to
                )

            if "status" in request.data and request.data["status"] != material_request.status:
                if serializer.validated_data["status"] != "CANCELLED":
                    return Response(status=403)
                else:
                    material_request.status = serializer.validated_data["status"]

        else:
            if "executed_mta_attachment" in request.data:
                add_attachment_to_material_request(
                    material_request,
                    serializer.validated_data["executed_mta_attachment"],
                    "executed_mta_attachment",
                    request.user,
                )

                send_material_request_notif(
                    "EXECUTED_MTA_UPLOADED", material_request, material_request.requester
                )

            if "status" in request.data:
                if serializer.validated_data["status"] == "CANCELLED":
                    return Response(status=403)
                material_request.status = serializer.validated_data["status"]
                send_transfer_update_notif(serializer.validated_data["status"], material_request)

        material_request.save()

        response_data = model_to_dict(material_request)
        response_data["requirements"] = self.get_material_requirements()

        return Response(data=response_data, status=200)
