from django.db import models

from resources_portal.models.organization import Organization
from resources_portal.models.user import User


class OrganizationUserSetting(models.Model):
    """ This model will store individual settings for each user and organization """

    class Meta:
        db_table = "organization_user_setting"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    new_request_notif = models.BooleanField(default=True)
    change_in_request_status_notif = models.BooleanField(default=True)
    request_approval_determined_notif = models.BooleanField(default=True)
    request_assigned_notif = models.BooleanField(default=True)
    reminder_notif = models.BooleanField(default=True)
    transfer_requested_notif = models.BooleanField(default=True)
    transfer_updated_notif = models.BooleanField(default=True)
    perms_granted_notif = models.BooleanField(default=True)

    user = models.ForeignKey(
        User,
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="organization_settings",
    )

    organization = models.ForeignKey(
        Organization,
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="user_settings",
    )

    # TODO: Add individual settings here
    # new_resource_request = models.BooleanField(default=True)
