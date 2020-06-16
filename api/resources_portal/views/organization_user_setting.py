from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from resources_portal.models import Organization, OrganizationUserSetting, User
from resources_portal.views.relation_serializers import (
    OrganizationRelationSerializer,
    UserRelationSerializer,
)


class OrganizationUserSettingSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

    class Meta:
        model = OrganizationUserSetting
        fields = (
            "id",
            "new_request_notif",
            "change_in_request_status_notif",
            "request_approval_determined_notif",
            "request_assigned_notif",
            "reminder_notif",
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

    serializer_class = OrganizationUserSettingSerializer
