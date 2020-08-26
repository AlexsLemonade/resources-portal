from pathlib import Path

from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from computedfields.models import ComputedFieldsModel, computed
from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.emailer import (
    EMAIL_SOURCE,
    LOGO_EMBEDDED_IMAGE_CONFIGS,
    NOTIFICATIONS_URL,
    PLAIN_TEXT_EMAIL_FOOTER,
    send_mail,
)
from resources_portal.models.material import Material
from resources_portal.models.material_request import MaterialRequest
from resources_portal.models.organization import Organization
from resources_portal.models.user import User

logger = get_and_configure_logger(__name__)


EMAIL_HTML_BODY = (
    Path("resources_portal/email_assets/notification-email-templated-inlined.html")
    .read_text()
    .replace("\n", "")
)
NOTIFICATIONS = {
    "MATERIAL_REQUEST_SHARER_ASSIGNED": {
        "plain_text_email": (
            "You have been assigned to a new request for {material_category}, "
            " {material_name}.\n\nView request details ({request_url}"
        ),
        "subject": "You are assigned to a new request",
        "body": "You have been assigned to a new request for {material_category}, .",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    }
}


class Notification(ComputedFieldsModel, SafeDeleteModel):
    class Meta:
        db_table = "notifications"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    NOTIFICATION_TYPES = tuple((key, key) for key in NOTIFICATIONS.keys())
    # NOTIFICATION_TYPES = (
    #     ("ADDED_TO_ORG", "ADDED_TO_ORG"),
    #     ("ORG_REQUEST_CREATED", "ORG_REQUEST_CREATED"),
    #     ("ORG_INVITE_CREATED", "ORG_INVITE_CREATED"),
    #     ("ORG_INVITE_ACCEPTED", "ORG_INVITE_ACCEPTED"),
    #     ("ORG_REQUEST_ACCEPTED", "ORG_REQUEST_ACCEPTED"),
    #     ("ORG_INVITE_REJECTED", "ORG_INVITE_REJECTED"),
    #     ("ORG_REQUEST_REJECTED", "ORG_REQUEST_REJECTED"),
    #     ("ORG_INVITE_INVALID", "ORG_INVITE_INVALID"),
    #     ("ORG_REQUEST_INVALID", "ORG_REQUEST_INVALID"),
    #     ("SIGNED_MTA_UPLOADED", "SIGNED_MTA_UPLOADED"),
    #     ("EXECUTED_MTA_UPLOADED", "EXECUTED_MTA_UPLOADED"),
    #     ("APPROVE_REQUESTS_PERM_GRANTED", "APPROVE_REQUESTS_PERM_GRANTED"),
    #     ("TRANSFER_REQUESTED", "TRANSFER_REQUESTED"),
    #     ("TRANSFER_APPROVED", "TRANSFER_APPROVED"),
    #     ("TRANSFER_REJECTED", "TRANSFER_REJECTED"),
    #     ("TRANSFER_CANCELLED", "TRANSFER_CANCELLED"),
    #     ("TRANSFER_FULFILLED", "TRANSFER_FULFILLED"),
    #     ("TRANSFER_VERIFIED_FULFILLED", "TRANSFER_VERIFIED_FULFILLED"),
    #     ("REMOVED_FROM_ORG", "REMOVED_FROM_ORG"),
    #     ("REQUEST_ISSUE_OPENED", "REQUEST_ISSUE_OPENED"),
    #     ("REQUEST_ISSUE_CLOSED", "REQUEST_ISSUE_CLOSED"),
    # )

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
    associated_material_request = models.ForeignKey(
        MaterialRequest, blank=False, null=True, on_delete=models.CASCADE
    )

    email = models.EmailField(blank=False, null=True)

    delivered = models.BooleanField(default=False)

    @computed(models.TextField(null=False, blank=False))
    def message(self):

        # This dict of lambdas is neccessary because not all notifications have a material or organization,
        # so evaluating them all as a dict results in a NoneType error.
        alert_messages = {
            "ADDED_TO_ORG": lambda: f"{self.associated_user.username} has added you to the organization  "
            f"{self.associated_organization.name}.",
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
            "TRANSFER_CANCELLED": lambda: f"Transfer of {self.associated_material.title} has been cancelled.",
            "TRANSFER_FULFILLED": lambda: f"Transfer of {self.associated_material.title} has been marked as fulfilled by "
            f"{self.associated_user.username} from {self.associated_organization.name}.",
            "TRANSFER_VERIFIED_FULFILLED": lambda: f"Transfer of {self.associated_material.title}"
            f" from {self.associated_organization.name} has been verified as fulfilled by "
            f"{self.associated_user.username}.",
            "REMOVED_FROM_ORG": lambda: f"You have been removed from {self.associated_organization.name}.",
            "REQUEST_ISSUE_OPENED": lambda: f"{self.associated_user.username} has opened an issue for their request of {self.associated_material.title}.",
            "REQUEST_ISSUE_CLOSED": lambda: f"An issue opened by {self.associated_user.username} for their request of {self.associated_material.title} has been closed.",
        }

        try:
            return alert_messages[self.notification_type]()
        except KeyError:
            raise ValueError(f'"{self.notification_type}" is not a valid notification type')


@receiver(post_save, sender="resources_portal.Notification")
def send_email_notification(sender, instance=None, created=False, **kwargs):
    # Check instance.delivered to allow creating a notification
    # without triggering an email.
    if not (
        created
        and not instance.delivered
        and (
            instance.notified_user.non_assigned_notifications
            or (
                instance.associated_material_request
                and instance.notified_user == instance.associated_material_request
            )
        )
    ):
        return

    # TODO: validate that the notification has all its required associations.

    # All the properties which can be used in template strings in the
    # config. If they don't get set because the association doesn't
    # exist, then they better not be needed.
    # TODO: create and raise a NotificationsMisconfigured exception if this isn't true.
    available_properties = {
        "notifications_url": NOTIFICATIONS_URL,
        "material_category": None,
        "material_name": None,
        "request_url": None,
    }
    if instance.associated_material:
        available_properties["material_category"] = instance.associated_material.category
        available_properties["material_name"] = instance.associated_material.title
    if instance.associated_material_request:
        available_properties["request_url"] = instance.associated_material_request.get_url()

    notification_config = NOTIFICATIONS[instance.notification_type]
    cta = notification_config["CTA"].format(**available_properties)
    cta_link = getattr(instance, notification_config["CTA_link_field"]).frontend_URL
    plain_text_email = (
        notification_config["plain_text_email"].format(**available_properties)
        + PLAIN_TEXT_EMAIL_FOOTER
    )
    body = notification_config["body"].format(**available_properties)
    subject = notification_config["subject"].format(**available_properties)

    formatted_html = (
        EMAIL_HTML_BODY.replace("REPLACE_MAIN_TEXT", body)
        .replace("REPLACE_CTA", cta)
        .replace("REPLACE_INVITATION_LINK", cta_link)
    )

    logger.info("Sending an email notification to {email}.")

    if settings.AWS_SES_DOMAIN:
        send_mail(
            EMAIL_SOURCE,
            [instance.notified_email],
            subject,
            plain_text_email,
            formatted_html,
            LOGO_EMBEDDED_IMAGE_CONFIGS,
        )
    else:
        logger.info(
            f'In prod the following message will be sent to the following address: "'
            f'"{instance.message}", "{instance.notified_user.email}".'
        )
