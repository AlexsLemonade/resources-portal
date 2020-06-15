from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

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

    delivered = models.BooleanField(null=True)

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
            "MTA_UPLOADED": lambda: f"{self.associated_user.username} uploaded an MTA for "
            f"{self.associated_material.title}.",
            "APPROVE_REQUESTS_PERM_GRANTED": lambda: f"{self.associated_user.username} granted you permission to approve "
            f"material transfer requests in {self.associated_organization.name}.",
            "TRANSFER_REQUESTED": lambda: f"{self.associated_user.username} requested transfer of "
            f'"{self.associated_material.title}".',
        }

        try:
            return alert_messages[self.notification_type]()
        except KeyError:
            raise ValueError(f'"{self.notification_type}" is not a valid notification type')


NOTIFICATION_SETTING_DICT = {
    "ORG_REQUEST_CREATED": "request_assigned_notif",
    "ORG_INVITE_CREATED": "new_request_notif",
    "ORG_INVITE_ACCEPTED": "change_in_request_status_notif",
    "ORG_REQUEST_ACCEPTED": "change_in_request_status_notif",
    "ORG_INVITE_REJECTED": "change_in_request_status_notif",
    "ORG_REQUEST_REJECTED": "change_in_request_status_notif",
    "ORG_INVITE_INVALID": "change_in_request_status_notif",
    "ORG_REQUEST_INVALID": "change_in_request_status_notif",
    "MTA_UPLOADED": "transfer_updated_notif",
    "APPROVE_REQUESTS_PERM_GRANTED": "perms_granted_notif",
    "TRANSFER_REQUESTED": "transfer_requested_notif",
}


@receiver(post_save, sender="resources_portal.Notification")
def send_email_notification(sender, instance=None, created=False, **kwargs):
    if created:
        # Check if user has settings turned on for this notificiation
        if instance.notified_user in instance.associated_organization.members.all():
            user_setting = OrganizationUserSetting.objects.get(
                user=instance.notified_user, organization=instance.associated_organization
            )
            if not getattr(user_setting, NOTIFICATION_SETTING_DICT[instance.notification_type]):
                instance.delivered = False
                instance.save()
                return

        instance.email = instance.notified_user.email
        print(
            f'\nOne day an email with the following message will be sent to the following address: "{instance.message}", "{instance.notified_user.email}". This isn\'t implemented yet.'
        )
        instance.delivered = True
        instance.save()
