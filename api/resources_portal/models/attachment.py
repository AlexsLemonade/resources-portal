from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Attachment(models.Model):
    class Meta:
        db_table = "attachments"
        get_latest_by = "updated_at"

    ATTACHMENT_TYPES = (
        ("MTA", "MTA"),
        ("SIGNED_MTA", "SIGNED_MTA"),
        ("IRB", "IRB"),
        ("SEQUENCE_MAP", "SEQUENCE_MAP"),
    )

    objects = models.Manager()

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

    deleted = models.BooleanField(default=False)

    @property
    def download_url(self):
        """A temporary URL from which the file can be downloaded. """

        if not self.deleted and self.s3_key and self.s3_bucket:
            return "https://s3.amazonaws.com/" + self.s3_bucket + "/" + self.s3_key
        else:
            return None
