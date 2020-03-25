from django.db import models

from .material import Material
from .user import User


class MaterialRequest(models.Model):
    class Meta:
        db_table = "material_requests"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    material = models.ForeignKey(
        Material, blank=False, null=False, on_delete=models.CASCADE, related_name="requests"
    )

    requester = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="material_requests"
    )

    assigned_to = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="assignments"
    )

    requester_signed_mta_s3_url = models.TextField(
        help_text="Url to download the MTA after it was signed by the requester"
    )
    irb_s3_url = models.TextField(help_text="Url to download the IRB")
    executed_mta_s3_url = models.TextField(
        help_text="Url to download the MTA after it has been signed by all parties."
    )

    is_active = models.BooleanField(default=True)

    # TODO: add possible choices for status
    status = models.CharField(max_length=255, blank=True, null=True)
