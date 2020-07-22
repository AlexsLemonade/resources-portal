from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

import boto3
from computedfields.models import ComputedFieldsModel, computed
from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.material import Material
from resources_portal.models.organization import Organization
from resources_portal.models.organization_user_setting import OrganizationUserSetting
from resources_portal.models.user import User


class Notification(ComputedFieldsModel, SafeDeleteModel):
    class Meta:
        db_table = "notifications"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    NOTIFICATION_TYPES = (
        ("ORG_REQUEST_CREATED", "ORG_REQUEST_CREATED"),
        ("ORG_INVITE_CREATED", "ORG_INVITE_CREATED"),
        ("ORG_INVITE_ACCEPTED", "ORG_INVITE_ACCEPTED"),
        ("ORG_REQUEST_ACCEPTED", "ORG_REQUEST_ACCEPTED"),
        ("ORG_INVITE_REJECTED", "ORG_INVITE_REJECTED"),
        ("ORG_REQUEST_REJECTED", "ORG_REQUEST_REJECTED"),
        ("ORG_INVITE_INVALID", "ORG_INVITE_INVALID"),
        ("ORG_REQUEST_INVALID", "ORG_REQUEST_INVALID"),
        ("SIGNED_MTA_UPLOADED", "SIGNED_MTA_UPLOADED"),
        ("EXECUTED_MTA_UPLOADED", "EXECUTED_MTA_UPLOADED"),
        ("APPROVE_REQUESTS_PERM_GRANTED", "APPROVE_REQUESTS_PERM_GRANTED"),
        ("TRANSFER_REQUESTED", "TRANSFER_REQUESTED"),
        ("TRANSFER_APPROVED", "TRANSFER_APPROVED"),
        ("TRANSFER_REJECTED", "TRANSFER_REJECTED"),
        ("TRANSFER_FULFILLED", "TRANSFER_FULFILLED"),
        ("REMOVED_FROM_ORG", "REMOVED_FROM_ORG"),
    )

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

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

    email = models.EmailField(blank=False, null=True)

    delivered = models.BooleanField(default=False)

    @computed(models.TextField(null=False, blank=False))
    def message(self):

        # This dict of lambdas is neccessary because not all notifications have a material or organization,
        # so evaluating them all as a dict results in a NoneType error.
        alert_messages = {
            "ORG_REQUEST_CREATED": lambda: f"{self.associated_user.username} is requesting to join "
            f"{self.associated_organization.name}.",
            "ORG_INVITE_CREATED": lambda: f"{self.associated_user.username} has invited you to join "
            f"{self.associated_organization.name}.",
            "ORG_INVITE_ACCEPTED": lambda: f"{self.associated_user.username} has accepted your invitation to join "
            f"{self.associated_organization.name}.",
            "ORG_REQUEST_ACCEPTED": lambda: f"{self.associated_user.username} has accepted your request to join "
            f"{self.associated_organization.name}.",
            "ORG_INVITE_REJECTED": lambda: f"{self.associated_user.username} has rejected your request to join "
            f"{self.associated_organization.name}.",
            "ORG_REQUEST_REJECTED": lambda: f"{self.associated_user.username} has rejected your invitation to join "
            f"{self.associated_organization.name}.",
            "ORG_INVITE_INVALID": lambda: f"You no longer have permissions to add members to {self.associated_organization.name}. "
            f"Your pending invitations have been canceled.",
            "ORG_REQUEST_INVALID": lambda: f"{self.associated_user.username} no longer has permissions to add members to "
            f"{self.associated_organization.name}. Please resubmit your request.",
            "SIGNED_MTA_UPLOADED": lambda: f"{self.associated_user.username} uploaded a signed MTA for "
            f"{self.associated_material.title}.",
            "EXECUTED_MTA_UPLOADED": lambda: f"{self.associated_user.username} uploaded an executed MTA for "
            f"{self.associated_material.title}.",
            "APPROVE_REQUESTS_PERM_GRANTED": lambda: f"{self.associated_user.username} granted you permission to approve "
            f"material transfer requests in {self.associated_organization.name}.",
            "TRANSFER_REQUESTED": lambda: f"{self.associated_user.username} requested transfer of "
            f'"{self.associated_material.title}".',
            "TRANSFER_APPROVED": lambda: f"Transfer of {self.associated_material.title} has been approved.",
            "TRANSFER_REJECTED": lambda: f"Transfer of {self.associated_material.title} has been rejected.",
            "TRANSFER_FULFILLED": lambda: f"Transfer of {self.associated_material.title} has been marked as fulfilled by "
            f"{self.associated_user.username} from {self.associated_organization.name}.",
            "REMOVED_FROM_ORG": lambda: f"You have been removed from {self.associated_organization.name}.",
        }

        try:
            return alert_messages[self.notification_type]()
        except KeyError:
            raise ValueError(f'"{self.notification_type}" is not a valid notification type')


# This enumerates the types of notifications so users can silence the types they don't want.
NOTIFICATION_SETTING_DICT = {
    "ORG_REQUEST_CREATED": "request_assigned_notif",
    "ORG_INVITE_CREATED": "new_request_notif",
    "ORG_INVITE_ACCEPTED": "change_in_request_status_notif",
    "ORG_REQUEST_ACCEPTED": "change_in_request_status_notif",
    "ORG_INVITE_REJECTED": "change_in_request_status_notif",
    "ORG_REQUEST_REJECTED": "change_in_request_status_notif",
    "ORG_INVITE_INVALID": "change_in_request_status_notif",
    "ORG_REQUEST_INVALID": "change_in_request_status_notif",
    "SIGNED_MTA_UPLOADED": "transfer_updated_notif",
    "EXECUTED_MTA_UPLOADED": "transfer_updated_notif",
    "APPROVE_REQUESTS_PERM_GRANTED": "perms_granted_notif",
    "TRANSFER_REQUESTED": "transfer_requested_notif",
    "TRANSFER_APPROVED": "transfer_updated_notif",
    "TRANSFER_REJECTED": "transfer_updated_notif",
    "TRANSFER_FULFILLED": "transfer_updated_notif",
    "REMOVED_FROM_ORG": "misc_notif",
}


@receiver(post_save, sender="resources_portal.Notification")
def send_email_notification(sender, instance=None, created=False, **kwargs):
    source_template = "Resources Portal Mail Robot <no-reply@{}>"

    # Check instance.delivered to allow creating a notification
    # without triggering an email.
    if created and not instance.delivered:
        # Check if user has settings turned on for this notificiation
        if instance.notified_user in instance.associated_organization.members.all():
            user_setting = OrganizationUserSetting.objects.get(
                user=instance.notified_user, organization=instance.associated_organization
            )
            if not getattr(user_setting, NOTIFICATION_SETTING_DICT[instance.notification_type]):
                return

        instance.email = instance.notified_user.email

        if settings.AWS_SES_DOMAIN:
            # Create a new SES resource and specify a region.
            # I need to pass region in as a env var.
            client = boto3.client("ses", region_name=settings.AWS_REGION)

            # Provide the contents of the email.
            client.send_email(
                Destination={"ToAddresses": [instance.email]},
                Message={
                    "Body": {"Text": {"Charset": "UTF-8", "Data": instance.message}},
                    "Subject": {
                        "Charset": "UTF-8",
                        "Data": "You have a new notification from the Resources Portal!",
                    },
                },
                Source=source_template.format(settings.AWS_SES_DOMAIN),
            )
        else:

            print(
                f'In prod the following message will be sent to the following address: "'
                f'"{instance.message}", "{instance.notified_user.email}".'
            )

        instance.delivered = True
        instance.save()
