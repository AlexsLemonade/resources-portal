import uuid

from django.contrib.auth.models import Permission
from django.db import models

from .organization import Organization
from .user import User


class OrganizationUserPermission(models.Model):
    class Meta:
        db_table = "organization_user_permission"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        Organization, blank=False, null=False, on_delete=models.CASCADE, related_name="permissions"
    )
    permission = models.ForeignKey(Permission, blank=False, null=False, on_delete=models.CASCADE)
