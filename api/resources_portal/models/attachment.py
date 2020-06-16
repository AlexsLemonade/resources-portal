from django.db import models


class Attachment(models.Model):
    class Meta:
        db_table = "attachments"
        get_latest_by = "updated_at"

        permissions = (("modify_attachment", "modify_attachment"),)

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
        "Material",
        blank=True,
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
