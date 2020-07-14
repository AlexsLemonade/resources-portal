from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from guardian.core import ObjectPermissionChecker

from resources_portal.models import Attachment, MaterialRequest, Organization
from resources_portal.views.relation_serializers import MaterialRelationSerializer


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            "id",
            "filename",
            "description",
            "s3_bucket",
            "s3_key",
            "s3_resource_deleted",
            "created_at",
            "updated_at",
            "sequence_map_for",
        )
        read_only_fields = ("id", "created_at", "updated_at")


def user_has_perm_on_active_material_request(user, perm):

    # Retrieve all organization permissions in a single query
    checker = ObjectPermissionChecker(user)
    organizations = Organization.objects.all()
    checker.prefetch_perms(organizations)

    # Uses prefetch_related to retrieve all related objects in a single query
    for organization in user.organizations.all().prefetch_related("materials"):
        if checker.has_perm(perm, organization):
            for material in organization.materials.all().prefetch_related("requests"):
                for request in material.requests.all():
                    if request.is_active:
                        return True
    return False


class AttachmentDetailSerializer(AttachmentSerializer):
    sequence_map_for = MaterialRelationSerializer(many=False, read_only=True)


class CanViewRequestsOrIsRequesterOrIsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
            or user_has_perm_on_active_material_request(request.user, "view_requests")
            or request.user.is_staff
        )


class CanApproveRequestsOrIsRequesterOrIsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
            or user_has_perm_on_active_material_request(request.user, "approve_requests")
            or request.user.is_staff
        )


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return AttachmentSerializer

        return AttachmentDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAuthenticated, IsAdminUser]
        elif self.action == "retrieve":
            permission_classes = [IsAuthenticated, CanViewRequestsOrIsRequesterOrIsAdminUser]
        else:
            permission_classes = [IsAuthenticated, CanApproveRequestsOrIsRequesterOrIsAdminUser]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if not (
            MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
            or user_has_perm_on_active_material_request(request.user, "approve_requests")
            or request.user.is_staff
        ):
            return Response(status=403)

        response = super(AttachmentViewSet, self).create(request, *args, **kwargs)
        return response
