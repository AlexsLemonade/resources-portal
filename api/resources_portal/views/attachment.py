import os

from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from rest_framework import serializers, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

import boto3
from botocore.client import Config
from guardian.core import ObjectPermissionChecker

from resources_portal.models import Attachment, MaterialRequest, Organization
from resources_portal.views.relation_serializers import MaterialRelationSerializer


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            "id",
            "filename",
            "description",
            "download_url",
            "s3_resource_deleted",
            "created_at",
            "updated_at",
            "sequence_map_for",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class AttachmentDetailSerializer(AttachmentSerializer):
    sequence_map_for = MaterialRelationSerializer(many=False, read_only=True)


def user_has_perm_on_active_material_request(user, perm):

    # Retrieve all organization permissions in a single query
    checker = ObjectPermissionChecker(user)
    organizations = Organization.objects.all()
    checker.prefetch_perms(organizations)

    # Uses prefetch_related to retrieve all related objects in a single query
    for organization in user.organizations.all().prefetch_related("materials"):
        if checker.has_perm(perm, organization):
            for material in organization.materials.all().prefetch_related("requests"):
                for request in material.requests.all():
                    if request.is_active:
                        return True
    return False


class CanViewRequestsOrIsRequesterOrIsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
            or user_has_perm_on_active_material_request(request.user, "view_requests")
            or request.user.is_staff
        )


class CanApproveRequestsOrIsRequesterOrIsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
            or user_has_perm_on_active_material_request(request.user, "approve_requests")
            or request.user.is_staff
        )


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.action == "list":
            return AttachmentSerializer

        return AttachmentDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAuthenticated, IsAdminUser]
        elif self.action == "retrieve":
            permission_classes = [IsAuthenticated, CanViewRequestsOrIsRequesterOrIsAdminUser]
        else:
            permission_classes = [IsAuthenticated, CanApproveRequestsOrIsRequesterOrIsAdminUser]

        return [permission() for permission in permission_classes]

    # If the file fails to upload, we don't want to create the
    # attachment object. We can't just upload the file first though,
    # because we want the path to have its id in it.
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        if not (
            MaterialRequest.objects.filter(requester=request.user, is_active=True).exists()
            or user_has_perm_on_active_material_request(request.user, "approve_requests")
            or request.user.is_staff
        ):
            return Response(status=403)

        uploaded_file = request.data.pop("file")[0]

        if uploaded_file.size / 1000.0 / 1000.0 / 1000.0 > 1:
            return Response(status=400, message="The uploaded file was greated than 1GB.")

        if "filename" not in request.data:
            request.data["filename"] = uploaded_file.name

        response = super(AttachmentViewSet, self).create(request, *args, **kwargs)

        attachment_id = response.data["id"]
        if settings.AWS_S3_BUCKET_NAME:
            # Upload the file to S3, then update the database object.
            bucket_name = settings.AWS_S3_BUCKET_NAME
            aws_key = f"attachment_{attachment_id}/{response.data['filename']}"

            s3_client = boto3.client("s3", config=Config(signature_version="s3v4"))
            s3_client.upload_fileobj(uploaded_file, bucket_name, aws_key)

            created_attachment = Attachment.objects.get(id=attachment_id)
            created_attachment.s3_bucket = bucket_name
            created_attachment.s3_key = aws_key
            created_attachment.save()

            created_attachment.refresh_from_db()

            response.data["download_url"] = created_attachment.download_url
            response.data["updated_at"] = created_attachment.updated_at
        else:
            attachment_path = os.path.join(
                settings.LOCAL_FILE_DIRECTORY, f"attachment_{attachment_id}"
            )
            os.mkdir(attachment_path)
            local_file_path = os.path.join(attachment_path, uploaded_file.name)
            with open(local_file_path, "wb") as local_file:
                for chunk in uploaded_file.chunks():
                    local_file.write(chunk)

        return response


def local_file_view(request, file_path):
    filename = os.path.basename(file_path)
    with open(os.path.join(settings.LOCAL_FILE_DIRECTORY, file_path), "rb") as open_file:
        file_data = open_file.read()

    response = HttpResponse(file_data, content_type="application/octet-stream")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    return response
