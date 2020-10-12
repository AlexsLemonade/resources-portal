from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Notification, User
from resources_portal.serializers import (
    GrantRelationSerializer,
    MaterialRelationSerializer,
    MaterialRequestIssueRelationSerializer,
    MaterialRequestRelationSerializer,
    OrganizationRelationSerializer,
    UserRelationSerializer,
)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = (
            "id",
            "notification_type",
            "notified_user",
            "associated_user",
            "organization",
            "message",
            "text_body",
            "grant",
            "material",
            "material_request",
            "material_request_issue",
            "human_readable_date",
            "email",
            "email_delivered",
            "email_delivered_at",
            "created_at",
        )
        read_only_fields = ("id", "created_by", "created_at", "updated_at")

    notified_user = UserRelationSerializer(read_only=True)
    associated_user = UserRelationSerializer(read_only=True)
    organization = OrganizationRelationSerializer(read_only=True)
    grant = GrantRelationSerializer(read_only=True)
    material = MaterialRelationSerializer(read_only=True)
    material_request = MaterialRequestRelationSerializer(read_only=True)
    material_request_issue = MaterialRequestIssueRelationSerializer(read_only=True)


class IsUserOrAdmin(BasePermission):
    def has_permission(self, request, view):
        user = User.objects.get(pk=view.kwargs["parent_lookup_user"])
        return request.user == user or request.user.is_staff

    def has_object_permission(self, request, view, obj):
        user = User.objects.get(pk=view.kwargs["parent_lookup_user"])
        return (request.user == user and user == obj.notified_user) or request.user.is_staff


class NotificationViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    http_method_names = ["list", "get", "head", "options"]
    permission_classes = [IsAuthenticated, IsUserOrAdmin]
    serializer_class = NotificationSerializer

    filterset_fields = {
        "id": ["exact"],
        "notification_type": ["exact"],
        "organization__id": ["exact"],
        "email_delivered": ["exact"],
        "created_at": ["exact", "lt", "gt", "lte", "gte"],
    }

    def get_queryset(self):
        return Notification.objects.filter(notified_user=self.request.user).order_by("-created_at")
