import logging

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from computedfields.models import ComputedFieldsModel, computed

from resources_portal.models.material import Material
from resources_portal.models.organization import Organization
from resources_portal.models.user import User

logger = logging.getLogger()
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())


class Notification(ComputedFieldsModel):
    class Meta:
        db_table = "notifications"
        get_latest_by = "created_at"

    NOTIFICATION_TYPES = (
        ("ORG_REQUEST_CREATED", "ORG_REQUEST_CREATED"),
        ("ORG_INVITE_CREATED", "ORG_INVITE_CREATED"),
        ("ORG_INVITE_ACCEPTED", "ORG_INVITE_ACCEPTED"),
        ("ORG_REQUEST_ACCEPTED", "ORG_REQUEST_ACCEPTED"),
        ("ORG_INVITE_REJECTED", "ORG_INVITE_REJECTED"),
        ("ORG_REQUEST_REJECTED", "ORG_REQUEST_REJECTED"),
        ("ORG_INVITE_INVALID", "ORG_INVITE_INVALID"),
        ("ORG_REQUEST_INVALID", "ORG_REQUEST_INVALID"),
        ("MTA_UPLOADED", "MTA_UPLOADED"),
        ("APPROVE_REQUESTS_PERM_GRANTED", "APPROVE_REQUESTS_PERM_GRANTED"),
        ("TRANSFER_REQUESTED", "TRANSFER_REQUESTED"),
    )

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)

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

    @computed(models.TextField(null=False, blank=False))
    def message(self):
        if self.notification_type == "ORG_REQUEST_CREATED":
            return f"{self.associated_user.username} is requesting to to join {self.associated_organization.name}."
        elif self.notification_type == "ORG_INVITE_CREATED":
            return f"{self.associated_user.username} has invited you to join {self.associated_organization.name}."
        elif self.notification_type == "ORG_INVITE_ACCEPTED":
            return f"{self.associated_user.username} has accepted your invitation to join {self.associated_organization.name}."
        elif self.notification_type == "ORG_REQUEST_ACCEPTED":
            return f"{self.associated_user.username} has accepted your request to join {self.associated_organization.name}."
        elif self.notification_type == "ORG_INVITE_REJECTED":
            return f"{self.associated_user.username} has rejected your request to join {self.associated_organization.name}."
        elif self.notification_type == "ORG_REQUEST_REJECTED":
            return f"{self.associated_user.username} has rejected your invitation to join {self.associated_organization.name}."
        elif self.notification_type == "ORG_INVITE_INVALID":
            return f"You no longer have permissions to add members to {self.associated_organization.name}. Your pending invitations have been canceled."
        elif self.notification_type == "ORG_REQUEST_INVALID":
            return f"{self.associated_user.username} no longer has permissions to add members to {self.associated_organization.name}. Please resubmit your request."
        elif self.notification_type == "MTA_UPLOADED":
            return f"{self.associated_user.username} uploaded an MTA for {self.associated_material.title}."
        elif self.notification_type == "APPROVE_REQUESTS_PERM_GRANTED":
            return f"{self.associated_user.username} granted you permission to approve material transfer requests in {self.associated_organization.name}."
        elif self.notification_type == "TRANSFER_REQUESTED":
            return f'{self.associated_user.username} requested transfer of "{self.associated_material.title}".'
        else:
            raise ValueError(f'"{self.notification_type}" is not a valid notification type')


@receiver(post_save, sender="resources_portal.Notification")
def send_email_notification(sender, instance=None, created=False, **kwargs):
    if created:
        logger.info(
            f'One day an email with the following message will be sent to the following address: "{instance.message}", "{instance.notified_user.email}". This isn\'t implemented yet.'
        )
