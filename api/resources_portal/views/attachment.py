from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated

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
    sequence_map_for = MaterialRelationSerializer()


class HasViewAttachmentOrIsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("view_attachment", obj) or request.user.is_superuser


class HasModifyAttachmentOrIsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("modify_attachment", obj) or request.user.is_superuser


class HasActiveMaterialRequestOrIsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        import pdb

        pdb.set_trace()
        return (
            MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
            or MaterialRequest.objects.filter(assigned_to=request.user, is_active=True).exists()
            or request.user.is_superuser
        )


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
            permission_classes = [IsAuthenticated, HasActiveMaterialRequestOrIsAdminUser]
        else:
            permission_classes = [IsAuthenticated, HasModifyAttachmentOrIsAdminUser]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        import pdb

        pdb.set_trace()
        response = super(AttachmentViewSet, self).create(request, *args, **kwargs)

        attachment = Attachment.objects.get(pk=response.data["id"])

        assign_perm("view_attachment", request.user, attachment)
        assign_perm("modify_attachment", request.user, attachment)

        return response
