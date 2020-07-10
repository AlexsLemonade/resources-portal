from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated

from resources_portal.models import Attachment
from resources_portal.views.relation_serializers import (
    MaterialRelationSerializer,
    OrganizationRelationSerializer,
    UserRelationSerializer,
)


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            "id",
            "filename",
            "description",
            "s3_bucket",
            "s3_key",
            "deleted",
            "created_at",
            "updated_at",
            "sequence_map_for",
            "owned_by_org",
            "owned_by_user",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class AttachmentDetailSerializer(AttachmentSerializer):
    sequence_map_for = MaterialRelationSerializer(many=False, read_only=True)
    owned_by_org = OrganizationRelationSerializer(many=False)
    owned_by_user = UserRelationSerializer(many=False)


def user_is_requester_on_active_material_request(user, organization):
    # Uses prefetch_related to retrieve all related objects in a single query
    for material in organization.materials.all().prefetch_related("requests"):
        for material_request in material.requests.all():
            if material_request.is_active and material_request.requester == user:
                return True
    return False


class OwnsAttachmentOrIsAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user in obj.owned_by_org.members.all() or request.user.is_staff


class OwnsAttachmentOrIsRequesterOrIsAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user in obj.owned_by_org.members.all()
            or user_is_requester_on_active_material_request(request.user, obj.owned_by_org)
            or request.user.is_staff
        )


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return AttachmentDetailSerializer

        return AttachmentSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAuthenticated, IsAdminUser]
        elif self.action == "create":
            permission_classes = [IsAuthenticated]
        elif self.action == "retrieve":
            permission_classes = [IsAuthenticated, OwnsAttachmentOrIsRequesterOrIsAdmin]
        else:
            permission_classes = [IsAuthenticated, OwnsAttachmentOrIsAdmin]

        return [permission() for permission in permission_classes]
