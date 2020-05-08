from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated

from resources_portal.models import Grant
from resources_portal.views.relation_serializers import (
    MaterialRelationSerializer,
    OrganizationRelationSerializer,
    UserRelationSerializer,
)


class GrantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grant
        fields = (
            "id",
            "title",
            "funder_id",
            "users",
            "organizations",
            "materials",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class GrantDetailSerializer(GrantSerializer):
    users = UserRelationSerializer(many=True, read_only=True)
    organizations = OrganizationRelationSerializer(many=True, read_only=True)
    materials = MaterialRelationSerializer(many=True, read_only=True)


class GrantListSerializer(GrantSerializer):
    users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    organizations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    materials = serializers.PrimaryKeyRelatedField(many=True, read_only=True)


class OwnsGrant(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user in obj.users.all()


class GrantViewSet(viewsets.ModelViewSet):
    queryset = Grant.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return GrantListSerializer

        return GrantDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAdminUser]
        elif self.action == "create":
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, OwnsGrant]

        return [permission() for permission in permission_classes]
