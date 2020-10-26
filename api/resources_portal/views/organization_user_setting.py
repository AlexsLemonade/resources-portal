from rest_framework import serializers, viewsets
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import BasePermission, IsAuthenticated

from resources_portal.models import Organization, OrganizationUserSetting, User


class OrganizationUserSettingSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

    class Meta:
        model = OrganizationUserSetting
        fields = (
            "id",
            "non_assigned_notifications",
            "weekly_digest",
            "user",
            "organization",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "user", "organization")


class IsUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user


class IsInOrganization(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user in obj.organization.members.all()


class OrganizationUserSettingViewSet(viewsets.ModelViewSet):
    queryset = OrganizationUserSetting.objects.all()

    http_method_names = ["get", "put", "patch", "head", "options"]

    permission_classes = [IsAuthenticated, IsUser, IsInOrganization]

    def get_serializer_class(self):
        if self.action == "list":
            raise MethodNotAllowed("GET", detail="Cannot list organization user settings")

        return OrganizationUserSettingSerializer
