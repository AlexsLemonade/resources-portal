from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from guardian.shortcuts import assign_perm

from resources_portal.models import Attachment, MaterialRequest
from resources_portal.views.relation_serializers import MaterialRelationSerializer


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            "id",
            "filename",
            "description",
            "s3_bucket",
            "s3_key",
            "deleted",
            "created_at",
            "updated_at",
            "sequence_map_for",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class AttachmentDetailSerializer(AttachmentSerializer):
    sequence_map_for = MaterialRelationSerializer(many=False, read_only=True)


class HasViewAttachmentOrIsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("view_attachment", obj) or request.user.is_staff


class HasModifyAttachmentOrIsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("modify_attachment", obj) or request.user.is_staff


def user_has_perms_for_organization_with_active_material_request(user):
    for organization in user.organizations.all():
        if user.has_perm("approve_requests", organization):
            for material in organization.materials.all():
                for request in material.requests.all():
                    if request.is_active:
                        return True
    return False


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return AttachmentSerializer

        return AttachmentDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAuthenticated, IsAdminUser]
        elif self.action == "retrieve":
            permission_classes = [IsAuthenticated, HasViewAttachmentOrIsAdminUser]
        elif self.action == "create":
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, HasModifyAttachmentOrIsAdminUser]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):

        if not (
            MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
            or user_has_perms_for_organization_with_active_material_request(request.user)
            or request.user.is_staff
        ):
            return Response(status=403)

        response = super(AttachmentViewSet, self).create(request, *args, **kwargs)

        attachment = Attachment.objects.get(pk=response.data["id"])

        assign_perm("view_attachment", request.user, attachment)
        assign_perm("modify_attachment", request.user, attachment)

        return response
