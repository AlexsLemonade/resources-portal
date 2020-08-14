from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated

from resources_portal.models import Grant, User
from resources_portal.views.relation_serializers import (
    MaterialRelationSerializer,
    OrganizationRelationSerializer,
)


class GrantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grant
        fields = (
            "id",
            "title",
            "funder_id",
            "user",
            "organizations",
            "materials",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class GrantDetailSerializer(GrantSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    organizations = OrganizationRelationSerializer(many=True, read_only=True)
    materials = MaterialRelationSerializer(many=True, read_only=True)


class GrantListSerializer(GrantSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    organizations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    materials = serializers.PrimaryKeyRelatedField(many=True, read_only=True)


class IsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser


class OwnsGrant(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user


class HasOtherGrants(BasePermission):
    """Users cannot delete their last grant"""

    def has_object_permission(self, request, view, obj):
        return request.user.grants.all().count() > 1


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
        elif self.action == "destroy":
            permission_classes = [IsAuthenticated, OwnsGrant, HasOtherGrants]
        else:
            permission_classes = [IsAuthenticated, OwnsGrant]

        return [permission() for permission in permission_classes]
