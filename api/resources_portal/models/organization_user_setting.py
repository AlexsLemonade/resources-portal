from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel


class OrganizationUserSetting(SafeDeleteModel):
    """ This model will store individual settings for each user and organization """

    class Meta:
        db_table = "organization_user_setting"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    non_assigned_notifications = models.BooleanField(default=False)
    weekly_digest = models.BooleanField(default=True)

    user = models.ForeignKey(
        "User",
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="organization_settings",
    )

    organization = models.ForeignKey(
        "Organization",
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="user_settings",
    )
