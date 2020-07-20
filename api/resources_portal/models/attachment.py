from django.conf import settings
from django.db import models
from django.urls import reverse

import boto3
from botocore.client import Config
from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel


class Attachment(SafeDeleteModel):
    class Meta:
        db_table = "attachments"
        get_latest_by = "updated_at"
        ordering = ["updated_at", "id"]

    ATTACHMENT_TYPES = (
        ("MTA", "MTA"),
        ("SIGNED_MTA", "SIGNED_MTA"),
        ("EXECUTED_MTA", "EXECUTED_MTA"),
        ("IRB", "IRB"),
        ("SIGNED_IRB", "SIGNED_IRB"),
        ("EXECUTED_IRB", "EXECUTED_IRB"),
        ("SEQUENCE_MAP", "SEQUENCE_MAP"),
    )

    objects = models.Manager()
    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    filename = models.TextField(blank=False, null=True, help_text="The name of the attachment.")
    description = models.TextField(
        blank=True, null=True, help_text="A description for the attachment."
    )
    attachment_type = models.CharField(max_length=32, choices=ATTACHMENT_TYPES, null=False)

    s3_bucket = models.CharField(max_length=255, blank=True, null=True)
    s3_key = models.CharField(max_length=255, blank=True, null=True)

    sequence_map_for = models.ForeignKey(
        "resources_portal.Material",
        null=True,
        on_delete=models.SET_NULL,
        related_name="sequence_maps",
        help_text="The cell line this seq_map is for. Only valid for seq_map attachments.",
        default=None,
    )

    s3_resource_deleted = models.BooleanField(default=False)

    @property
    def download_url(self):
        """A temporary URL from which the file can be downloaded.
        """
        if (
            not self.s3_resource_deleted
            and self.s3_key
            and self.s3_bucket
            and settings.AWS_S3_BUCKET_NAME
        ):
            s3_client = boto3.client("s3", config=Config(signature_version="s3v4"))
            return s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": self.s3_bucket, "Key": self.s3_key},
                ExpiresIn=(60 * 60 * 24),  # 1 day in seconds.
            )
        elif settings.LOCAL_FILE_DIRECTORY:
            return reverse("uploaded-file", args=[f"attachment_{self.id}/{self.filename}"])
        else:
            return None
