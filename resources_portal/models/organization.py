from django.db import models

from .user import User


class Organization(models.Model):
    class Meta:
        db_table = "organizations"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    owner = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="owned_organizations"
    )
