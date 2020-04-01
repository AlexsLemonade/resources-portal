from django.contrib.postgres.fields import JSONField
from django.db import models

from resources_portal.models.user import User


class Material(models.Model):
    class Meta:
        db_table = "materials"
        get_latest_by = "created_at"

    MATERIAL_TYPE_CHOICES = (
        ("CELL_LINE", "CELL_LINE"),
        ("PLASMID", "PLASMID"),
        ("PROTOCOL", "PROTOCOL"),
        ("DATASET", "DATASET"),
        ("MOUSE_MODEL", "MOUSE_MODEL"),
        ("ZEBRAFISH_MODEL", "ZEBRAFISH_MODEL"),
    )

    objects = models.Manager()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    material_type = models.CharField(max_length=32, choices=MATERIAL_TYPE_CHOICES)
    url = models.TextField(blank=True, null=True)
    pubmed_id = models.CharField(max_length=32, blank=True)

    additional_metadata = JSONField(default=dict)

    mta_s3_url = models.TextField(
        blank=True, null=True, help_text="Contains an url to download the MTA."
    )
    needs_mta = models.BooleanField(default=False)
    needs_irb = models.BooleanField(default=False)

    contact_user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        "Organization", blank=False, null=False, on_delete=models.CASCADE, related_name="materials"
    )
