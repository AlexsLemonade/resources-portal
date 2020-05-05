from django.db import models

from resources_portal.models.material import Material
from resources_portal.models.organization import Organization
from resources_portal.models.user import User


class Notification(models.Model):
    class Meta:
        db_table = "notifications"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)

    message = models.TextField()
    notified_user = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="notifications"
    )
    associated_user = models.ForeignKey(
        User,
        blank=False,
        null=True,
        on_delete=models.CASCADE,
        related_name="associated_notifications",
    )
    associated_organization = models.ForeignKey(
        Organization, blank=False, null=True, on_delete=models.CASCADE
    )
    associated_material = models.ForeignKey(
        Material, blank=False, null=True, on_delete=models.CASCADE
    )
