from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated

from guardian.shortcuts import assign_perm

from resources_portal.models import Attachment, MaterialRequest
from resources_portal.views.relation_serializers import (
    MaterialSerializer,
    OrganizationRelationSerializer,
    UserRelationSerializer,
)


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            "id",
            "filename",
            "description",
            "s3_bucket",
            "s3_key",
            "sequence_map_for",
            "deleted",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class AttachmentDetailSerializer(AttachmentSerializer):
    sequence_map_for = MaterialSerializer()


class HasViewAttachment(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("view_attachment", obj)


class HasModifyAttachment(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("modify_attachment", obj)


class HasActiveMaterialRequest(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
            or MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
        )


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return AttachmentSerializer

        return AttachmentDetailSerializer

    def get_permissions(self):
        if self.action == "list" or self.action == "retrieve":
            permission_classes = [IsAuthenticated, HasViewAttachment, IsAdminUser]
        elif self.action == "create":
            permission_classes = [IsAuthenticated, HasActiveMaterialRequest, IsAdminUser]
        else:
            permission_classes = [IsAuthenticated, HasModifyAttachment, IsAdminUser]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        response = super(AttachmentViewSet, self).create(request, *args, **kwargs)

        attachment = Attachment.objects.get(pk=response.data["id"])

        assign_perm("view_attachment", request.user, attachment)
        assign_perm("modify_attachment", request.user, attachment)

    def update(self, request, *args, **kwargs):
        material = self.get_object()
        serializer = self.get_serializer(material, data=request.data)
        serializer.is_valid(raise_exception=True)

        new_organization = serializer.validated_data["organization"]

        if material.organization != new_organization:
            if not request.user.has_perm("add_resources", new_organization):
                return Response(status=status.HTTP_403_FORBIDDEN)

        return super(MaterialViewSet, self).update(request, *args, **kwargs)
