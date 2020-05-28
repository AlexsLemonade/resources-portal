from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated

from resources_portal.models import MaterialRequest
from resources_portal.views.relation_serializers import (
    MaterialRelationSerializer,
    OrganizationRelationSerializer,
    UserRelationSerializer,
)


class MaterialRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequest
        fields = (
            "id",
            "is_active",
            "status",
            "assigned_to_id",
            "executed_mta_attachement_id",
            "irb_attachment_id",
            "material_id",
            "requester_id",
            "requester_signed_mta_attachment_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class MaterialRequestDetailSerializer(MaterialRequestSerializer):
    pass


class MaterialRequestListSerializer(MaterialRequestSerializer):
    pass


class IsInMaterialOrganization(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user in obj.material.organization.users.all()


class MaterialRequestViewSet(viewsets.ModelViewSet):
    queryset = MaterialRequest.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return MaterialRequestSerializer

        return MaterialRequestDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAdminUser]
        elif self.action == "create":
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, OwnsGrant]

        return [permission() for permission in permission_classes]
