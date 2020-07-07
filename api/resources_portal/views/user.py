from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated

from resources_portal.models import User
from resources_portal.views.organization_user_setting import OrganizationUserSettingSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "orcid",
            "created_at",
            "updated_at",
            "organization_settings",
        )
        read_only_fields = ("username", "created_at", "updated_at")


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
