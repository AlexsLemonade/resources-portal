import uuid

from django.db import models

from .user import User


class UserNotification(models.Model):
    class Meta:
        db_table = "user_notifications"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    user = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="notifications"
    )

    # TODO: add possible choices
    event_type = models.CharField(max_length=255, blank=True, null=True)
    # TODO: check type of this field
    assigned_only = models.BooleanField()
