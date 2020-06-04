from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from resources_portal.models import OrganizationUserSetting
from resources_portal.views.organization import OrganizationSerializer
from resources_portal.views.user import UserSerializer


class OrganizationUserSettingSerializer(serializers.ModelSerializer):
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


class OrganizationUserSettingDetailSerializer(OrganizationUserSettingSerializer):
    organization = OrganizationSerializer()
    user = UserSerializer()


class IsUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user


class OrganizationUserSettingViewSet(viewsets.ModelViewSet):
    queryset = OrganizationUserSetting.objects.all()

    http_method_names = ["get", "put", "patch", "head", "options"]

    permission_classes = [IsAuthenticated, IsUser]

    def get_serializer_class(self):
        if self.action == "list":
            return Response(status=403)

        return OrganizationUserSettingDetailSerializer
