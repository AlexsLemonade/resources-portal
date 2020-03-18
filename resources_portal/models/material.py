from django.contrib.postgres.fields import JSONField
from django.db import models

from .user import User


class Material(models.Model):
    class Meta:
        db_table = "materials"
        get_latest_by = "created_at"

    objects = models.Manager()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    material_type = models.CharField(max_length=32)
    url = models.TextField(blank=True)
    pubmed_id = models.CharField(max_length=32, blank=True)
    url = models.CharField(max_length=255, blank=True, null=True)

    additional_metadata = JSONField(default=dict)

    mta = models.CharField(
        max_length=255, blank=True, null=True, help_text="Contains an url to download the MTA."
    )
    needs_mta = models.BooleanField(default=False)
    needs_irb = models.BooleanField(default=False)

    contact_user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        "Organization", blank=False, null=False, on_delete=models.CASCADE, related_name="materials"
    )
