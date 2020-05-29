import enum

from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from resources_portal.models import Material, MaterialRequest, Notification, User
from resources_portal.views.attachment import AttachmentSerializer
from resources_portal.views.material import MaterialSerializer
from resources_portal.views.user import UserSerializer


class Requirements(enum.Enum):
    NEEDS_TO_BE_APPROVED = (1,)
    NEEDS_MTA_FROM_REQUESTER = (2,)
    NEEDS_MTA_TO_BE_SIGNED = (3,)
    NEEDS_IRB = 4


SHARER_MODIFIABLE_FIELDS = {"status", "executed_mta_attachment"}

REQUESTER_MODIFIABLE_FIELDS = {"irb_attachment", "requester_signed_mta_attachment"}


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
        read_only_fields = ("id", "created_at", "updated_at")


class MaterialRequestDetailSerializer(MaterialRequestSerializer):
    assigned_to = UserSerializer()
    requester = UserSerializer()
    material = MaterialSerializer()
    executed_mta_attachment = AttachmentSerializer()
    irb_attachment = AttachmentSerializer()
    requester_signed_mta_attachment = AttachmentSerializer()


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


class IsRequester(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.requester


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
        elif self.action == "delete":
            permission_classes = [
                IsAuthenticated,
                IsRequester,
            ]
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
            requirements_list.append(Requirements.NEEDS_TO_BE_APPROVED)

        if material.needs_mta and not request.requester_signed_mta_attachment:
            requirements_list.append(Requirements.NEEDS_MTA_TO_BE_SIGNED)

        if material.needs_mta and not request.executed_mta_attachment:
            requirements_list.append(Requirements.NEEDS_MTA_TO_BE_SIGNED)

        if material.needs_irb and not request.irb_attachment:
            requirements_list.append(Requirements.NEEDS_IRB)

        return requirements_list

    def create(self, request, *args, **kwargs):
        serializer = MaterialRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        material = Material.objects.get(serializer.validated_data["material"])
        serializer.validated_data["assigned_to"] = material.contact_user.id

        response = super(MaterialRequestViewSet, self).create(request, *args, **kwargs)

        sharer = User.objects.get(pk=response.data["assigned_to_id"])
        organization = Material.objects.get(pk=response.data["material_id"]).organization

        notification = Notification(
            notification_type="TRANSFER_REQUESTED",
            notified_user=sharer,
            associated_user=request.user,
            associated_organization=organization,
        )
        notification.save()

        return response

    def update(self, request, *args, **kwargs):
        material_request = self.get_object()
        serializer = self.get_serializer(material_request, data=request.data)
        serializer.is_valid(raise_exception=True)

        changed_fields = {request.data.keys()} - {serializer.validated_data}

        if request.user == material_request.requester:
            if not changed_fields.issubset(REQUESTER_MODIFIABLE_FIELDS):
                return Response(status=403)
        else:
            if not changed_fields.issubset(SHARER_MODIFIABLE_FIELDS):
                return Response(status=403)

        response = super(MaterialRequestViewSet, self).update(request, *args, **kwargs)

        response.data["requirements"] = self.get_material_requirements()

        return response
