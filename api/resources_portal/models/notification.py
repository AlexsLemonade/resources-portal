import logging

from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver

from resources_portal.models.material import Material
from resources_portal.models.organization import Organization
from resources_portal.models.user import User

logger = logging.getLogger()
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())


class Notification(models.Model):
    class Meta:
        db_table = "notifications"
        get_latest_by = "created_at"

    def get_message(self):
        if self.notification_type == "REQUEST_CREATED":
            return f"{self.associated_user} is requesting to to join {self.associated_organization}"
        elif self.notification_type == "INVITE_CREATED":
            return f"{self.associated_user} has invited you to join {self.associated_organization}"
        elif self.notification_type == "INVITE_ACCEPTED":
            return f"{self.associated_user} has accepted your invitation to join {self.associated_organization}"
        elif self.notification_type == "REQUEST_ACCEPTED":
            return f"{self.associated_user} has accepted your request to join {self.associated_organization}"
        elif self.notification_type == "INVITE_REJECTED":
            return f"{self.associated_user} has rejected your request to join {self.associated_organization}"
        elif self.notification_type == "REQUEST_REJECTED":
            return f"{self.associated_user} has rejected your invitation to join {self.associated_organization}"
        elif self.notification_type == "INVITE_INVALID":
            return f"You no longer have permissions to add members to {self.associated_organization}. Your pending invitations have been canceled."
        elif self.notification_type == "REQUEST_INVALID":
            return f"{self.associated_user} no longer has permissions to add members to {self.associated_organization}. Please resubmit your request."

    NOTIFICATION_TYPES = (
        ("REQUEST_CREATED", "REQUEST_CREATED"),
        ("INVITE_CREATED", "INVITE_CREATED"),
        ("INVITE_ACCEPTED", "INVITE_ACCEPTED"),
        ("REQUEST_ACCEPTED", "REQUEST_ACCEPTED"),
        ("INVITE_REJECTED", "INVITE_REJECTED"),
        ("REQUEST_REJECTED", "REQUEST_REJECTED"),
        ("INVITE_INVALID", "INVITE_INVALID"),
        ("REQUEST_INVALID", "REQUEST_INVALID"),
    )

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)

    message = models.TextField(null=False, blank=False)
    notification_type = models.CharField(max_length=32, choices=NOTIFICATION_TYPES)
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

    def save(self, *args, **kwargs):
        self.message = self.get_message()
        super(Notification, self).save(*args, **kwargs)


@receiver(pre_save, sender="resources_portal.Notification")
def send_email_notification(sender, instance=None, created=False, **kwargs):
    if created:
        logger.info(
            f"One day an email with the following message will be sent to the following address: {instance.message}, {instance.notified_user.email}. This isn't implemented yet."
        )
