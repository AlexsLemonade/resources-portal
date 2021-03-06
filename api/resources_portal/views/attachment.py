import os
import shutil

from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

import boto3
from botocore.client import Config

from resources_portal.models import Attachment
from resources_portal.serializers import (
    MaterialRelationSerializer,
    MaterialRequestRelationSerializer,
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
            "download_url",
            "s3_resource_deleted",
            "created_at",
            "updated_at",
            "sequence_map_for",
            "mta_materials",
            "requests_signed_mta",
            "requests_irb",
            "requests_executed_mta",
            "owned_by_org",
            "owned_by_user",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class AttachmentDetailSerializer(AttachmentSerializer):
    sequence_map_for = MaterialRelationSerializer(many=False, read_only=True)
    mta_materials = MaterialRelationSerializer(many=True, read_only=True)
    owned_by_org = OrganizationRelationSerializer(many=False)
    owned_by_user = UserRelationSerializer(many=False)
    requests_signed_mta = MaterialRequestRelationSerializer(many=True)
    requests_irb = MaterialRequestRelationSerializer(many=True)
    requests_executed_mta = MaterialRequestRelationSerializer(many=True)


class OwnsAttachmentOrIsAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user == obj.owned_by_user
            or request.user.is_staff
            or (obj.owned_by_org and request.user in obj.owned_by_org.members.all())
        )


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return AttachmentDetailSerializer

        return AttachmentSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAuthenticated, IsAdminUser]
        elif self.action == "create":
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, OwnsAttachmentOrIsAdmin]

        return [permission() for permission in permission_classes]

    # If the file fails to upload, we don't want to create the
    # attachment object. We can't just upload the file first though,
    # because we want the path to have its id in it.
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        uploaded_file = request.data.pop("file")[0]

        if uploaded_file.size / 1000.0 / 1000.0 / 1000.0 > 1:
            return Response(status=400, message="The uploaded file was greated than 1GB.")

        if "filename" not in request.data:
            request.data["filename"] = uploaded_file.name

        request.data["owned_by_user"] = request.user.id

        response = super(AttachmentViewSet, self).create(request, *args, **kwargs)

        attachment_id = response.data["id"]
        if settings.AWS_S3_BUCKET_NAME:
            # Upload the file to S3, then update the database object.
            bucket_name = settings.AWS_S3_BUCKET_NAME
            s3_key = f"attachment_{attachment_id}/{response.data['filename']}"

            s3_client = boto3.client("s3", config=Config(signature_version="s3v4"))
            s3_client.upload_fileobj(uploaded_file, bucket_name, s3_key)

            created_attachment = Attachment.objects.get(id=attachment_id)
            created_attachment.s3_bucket = bucket_name
            created_attachment.s3_key = s3_key
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def attachment_copy_view(request, attachment_id):
    old_attachment = Attachment.objects.get(pk=attachment_id)

    # First, make sure they own the attachment
    if not (
        request.user == old_attachment.owned_by_user
        or (
            old_attachment.owned_by_org
            and request.user in old_attachment.owned_by_org.members.all()
        )
    ):
        return Response(status=status.HTTP_403_FORBIDDEN)

    if old_attachment.s3_resource_deleted:
        return Response(
            status=status.HTTP_400_BAD_REQUEST,
            message="You cannot copy an attachment which has been deleted.",
        )

    # Copy most of the fields.
    new_attachment = Attachment.objects.create(
        filename=old_attachment.filename,
        description=old_attachment.description,
        attachment_type=old_attachment.attachment_type,
        owned_by_user=old_attachment.owned_by_user,
        owned_by_org=old_attachment.owned_by_org,
        sequence_map_for=old_attachment.sequence_map_for,
    )

    response = Response(status=status.HTTP_201_CREATED)
    response.data = AttachmentDetailSerializer(new_attachment).data

    if settings.AWS_S3_BUCKET_NAME:
        # Upload the file to S3, then update the database object.
        new_key = f"attachment_{new_attachment.id}/{old_attachment.filename}"

        s3_client = boto3.client("s3", config=Config(signature_version="s3v4"))
        s3_client.Object(old_attachment.s3_bucket, new_key).copy_from(
            CopySource=f"{old_attachment.s3_bucket}/{old_attachment.s3_key}"
        )

        new_attachment.s3_bucket = old_attachment.s3_bucket
        new_attachment.s3_key = new_key
        new_attachment.save()

        new_attachment.refresh_from_db()

        response.data["download_url"] = new_attachment.download_url
        response.data["updated_at"] = new_attachment.updated_at
    else:
        os.mkdir(new_attachment.local_file_dir)
        shutil.copyfile(old_attachment.local_file_path, new_attachment.local_file_path)

    return response
