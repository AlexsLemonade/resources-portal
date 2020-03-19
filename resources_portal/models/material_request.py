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

    # TODO: Update types if these are Files or Urls
    requester_signed_mta = models.CharField(max_length=255, blank=True, null=True)
    irb = models.CharField(max_length=255, blank=True, null=True)

    executed_mta = models.CharField(max_length=255, blank=True, null=True)

    is_active = models.BooleanField(default=True)

    # TODO: add possible choices for status
    status = models.CharField(max_length=255, blank=True, null=True)
