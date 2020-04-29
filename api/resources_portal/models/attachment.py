from django.db import models


class Attachment(models.Model):
    class Meta:
        db_table = "attachments"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    filename = models.TextField(blank=False, null=True, help_text="The name of the attachment.")

    s3_bucket = models.CharField(max_length=255, blank=True, null=True)
    s3_key = models.CharField(max_length=255, blank=True, null=True)

    sequence_map_for = models.ForeignKey(
        "resources_portal.Material",
        blank=False,
        null=True,
        on_delete=models.SET_NULL,
        related_name="sequence_maps",
        help_text="The cell line this seq_map is for. Only valid for seq_map attachments.",
    )

    deleted = models.BooleanField(default=False)

    @property
    def download_url(self):
        """A temporary URL from which the file can be downloaded. """

        if not self.deleted and self.s3_key and self.s3_bucket:
            return "https://s3.amazonaws.com/" + self.s3_bucket + "/" + self.s3_key
        else:
            return None
