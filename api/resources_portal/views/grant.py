from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated

from resources_portal.models import Grant, User
from resources_portal.serializers import MaterialRelationSerializer, OrganizationRelationSerializer

BAD_DISASSOCIATION_ERROR = "You may not disassociate your last grant from your user."


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
    user = serializers.PrimaryKeyRelatedField(allow_null=True, queryset=User.objects.all())
    organizations = OrganizationRelationSerializer(many=True, read_only=True)
    materials = MaterialRelationSerializer(many=True, read_only=True)


class GrantListSerializer(GrantSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    organizations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    materials = serializers.PrimaryKeyRelatedField(many=True, read_only=True)


class OwnsGrant(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user


class GrantViewSet(viewsets.ModelViewSet):
    queryset = Grant.objects.all()
    filterset_fields = (
        "id",
        "funder_id",
    )

    # Don't allow delete.
    http_method_names = ["post", "put", "get", "head", "options"]

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

    def update(self, request, *args, **kwargs):
        grant = self.get_object()
        serializer = self.get_serializer(grant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if (
            "user" in serializer.validated_data
            and serializer.validated_data["user"] is None
            and grant.user
            and grant.user.grants.all().count() < 2
        ):
            raise ValidationError(BAD_DISASSOCIATION_ERROR)

        return super(GrantViewSet, self).update(request, *args, **kwargs)
