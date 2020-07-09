from django.conf import settings
from django.db import models
from django.urls import reverse

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
        ("IRB", "IRB"),
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
        """A temporary URL from which the file can be downloaded. """

        if not self.deleted and self.s3_key and self.s3_bucket:
            return "https://s3.amazonaws.com/" + self.s3_bucket + "/" + self.s3_key
        elif settings.LOCAL_FILE_DIRECTORY:
            return reverse("uploaded-file", args=[f"attachment_{self.id}/{self.filename}"])
        else:
            return None
