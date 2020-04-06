from django.contrib.postgres.fields import JSONField
from django.db import models

from resources_portal.models.user import User


class Material(models.Model):
    class Meta:
        db_table = "materials"
        get_latest_by = "created_at"

    CATEGORY_CHOICES = (
        ("CELL_LINE", "CELL_LINE"),
        ("PLASMID", "PLASMID"),
        ("PROTOCOL", "PROTOCOL"),
        ("DATASET", "DATASET"),
        ("MOUSE_MODEL", "MOUSE_MODEL"),
        ("ZEBRAFISH_MODEL", "ZEBRAFISH_MODEL"),
        ("PDX", "PDX"),
        ("OTHER", "OTHER"),
    )

    objects = models.Manager()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    title = models.TextField()
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES)
    url = models.TextField(blank=True, null=True)
    pubmed_id = models.CharField(max_length=32, blank=True)

    additional_metadata = JSONField(default=dict)

    mta_s3_url = models.TextField(
        blank=True, null=True, help_text="Contains an url to download the MTA."
    )

    title = models.TextField(
        blank=False, null=False, help_text="The title of the material.", default="New Material"
    )

    needs_mta = models.BooleanField(default=False)
    needs_irb = models.BooleanField(default=False)

    contact_user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        "Organization", blank=False, null=False, on_delete=models.CASCADE, related_name="materials"
    )
