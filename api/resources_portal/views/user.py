from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated

from resources_portal.models import User
from resources_portal.views.relation_serializers import (
    AddressRelationSerializer,
    AttachmentRelationSerializer,
    MaterialRequestRelationSerializer,
    OrganizationInvitationRelationSerializer,
    OrganizationRelationSerializer,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "orcid",
            "owned_attachments",
            "material_requests",
            "invitations",
            "organizations",
            "owned_organizations",
            "assignments",
            "addresses",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "username",
            "created_at",
            "updated_at",
            "attachments",
            "material_requests",
            "invitations",
            "assignments",
            "organizations",
            "addresses",
            "owned_organizations",
        )

    owned_attachments = AttachmentRelationSerializer(many=True, read_only=True)
    organizations = OrganizationRelationSerializer(many=True, read_only=True)
    owned_organizations = OrganizationRelationSerializer(many=True, read_only=True)
    material_requests = MaterialRequestRelationSerializer(many=True, read_only=True)
    assignments = MaterialRequestRelationSerializer(many=True, read_only=True)
    invitations = OrganizationInvitationRelationSerializer(many=True, read_only=True)
    addresses = AddressRelationSerializer(many=True, read_only=True)


class IsUserOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj or request.user.is_superuser


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    http_method_names = ["get", "delete", "put", "patch", "head", "options"]

    def get_permissions(self):
        if self.action == "update" or self.action == "partial_update" or self.action == "destroy":
            permission_classes = [IsAuthenticated, IsUserOrAdmin]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]
