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
    "MATERIAL_REQUEST_SHARER_ASSIGNED_NEW": {
        "subject": "You are assigned to a new request",
        "body": "You have been assigned to a new request for {material_category}, .",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\nYou have been assigned to a new request for {material_category}, "
            " {material_name}.\n\nView request details ({request_url})",
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_RECEIVED": {
        "subject": "<team name>: New Request for <resource type>",
        "body": "<Team name> received a new request received for <resource type> <resource name>.",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n <Team name> received a new request received for <resource type>,"
            " {material_name}.\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_ASSIGNED": {
        "subject": "<team name>: You are assigned to a request for <resource type>",
        "body": "You have been assigned to a request for <resource type>, <resource name> from <Requester>.",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\nYou have been assigned to a request for {material_category},"
            " {material_name} from <Requester>.\n\nView request details ({request_url})",
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_ASSIGNMENT": {
        "subject": "<team member> assigned to request for <resource type>",
        "body": " <team member> has been assigned to a request for <resource type>, <resource name> from <Requester>",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n<team member> has been assigned to a request for <resource type>,"
            " {material_name} from <Requester>.\n\nView request details ({request_url})",
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_APPROVED": {
        "subject": "Request for <resource type> accepted",
        "body": (
            "You/<Team member> accepted a request for <resource type>, <resource name> from <Requester>."
            "Waiting for <Requester> to provide the following information:\n{required_information}"
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\nYou/<Team member> accepted a request for <resource type>, <resource name> from <Requester>."
            "\nWaiting for <Requester> to provide the following information:\n{required_information}:"
            "\n\nView request details ({request_url})"
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_RECEIVED_INFO": {
        "subject": "Action Required: Received additional information from <Requester>",
        "body": "<Requester> provided the following required items for a request for <resource type>, <resource name>:\n{provided_information}",
        "CTA": "Review Items",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n<Requester> provided the following required items for a request for"
            " <resource type>, <resource name>:{provided_information}\n\nReview items ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_RECEIVED_MTA": {
        "subject": "Action Required: Request for <resource type>",
        "body": (
            "<Requester> provided the following additional documents for a request for"
            " <resource type><resource name>\n - MTA signed by <Requester>"
            "\nPlease sign and upload the requester signed MTA"
        ),
        "CTA": "Upload Fully Executed MTA",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n<Requester> provided the following additional documents"
            " for a request for <resource type>, <resource name>"
            "\n- MTA signed by <Requester> \nPlease sign and upload the requester signed MTA."
            "\n\nUpload fully executed MTA. ({request_url})."
        ),
        "attachments": ["MATERIAL_REQUESTER_SIGNED_MTA"],
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_EXECUTED_MTA": {
        "subject": "Uploaded executed MTA for request for <resource type>",
        "body": (
            "You/<Team member> uploaded the fully executed MTA for a request for"
            " <resource type>, <resource name> from <Requester name>."
            "\nPlease make arrangements to send the <resource type> to <Requester>."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\nYou/<Team member> uploaded the fully executed MTA"
            " for a request for <resource type>, <resource name> from <Requester name>."
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_FULFILLED": {
        "subject": "Fulfilled: Request for <resource type>",
        "body": (
            "You/<Team member> marked a request for <resource type>, <resource name>"
            " from <Requester> as Fulfilled."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\nYou/<Team member> marked a request for <resource type>,"
            " <resource name> from <Requester> as Fulfilled."
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_SHARER_VERIFIED": {
        "subject": "<Requester> received <resource type>",
        "body": "<Requester> confirmed receipt of <resource type>, <resource name>.",
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n<Requester> confirmed receipt of <resource type>, <resource name>."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_ISSUE_SHARER_REPORTED": {
        "subject": "Issue reported: Request for <resource type>",
        "body": (
            "<Requester> has reported an issue with a fulfilled request for"
            " <resource type>, <resource name>.\n<Description of issue> "
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n<Requester> has reported an issue with a fulfilled request for"
            " <resource type>, <resource name>.\n<Description of issue>"
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_ACCEPTED": {
        "subject": "Action required: Request for <resource type> accepted",
        "body": (
            "<team name> has accepted your request for <resource type>, <resource name> "
            "on the condition that you provide the following items:\n{required_information}"
        ),
        "CTA": "Provide Additional Items",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n<team name> has accepted your request for <resource type>, <resource name> "
            "on the condition that you provide the following items:\n{required_information}"
            "\n\nProvide Additional Items. ({request_url})."
        ),
        "attachments": ["MATERIAL_REQUESTER_SIGNED_MTA"],
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT": {
        "subject": "In fulfillment: Request for <resource type> accepted",
        "body": (
            "<team name> has accepted your request for <resource type>,"
            " <resource name> and is working to fulfill your request."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n<team name> has accepted your request for <resource type>,"
            " <resource name> and is working to fulfill your request."
            "\n\nView request details. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA": {
        "subject": "Executed MTA uploaded for request for <resource type>",
        "body": (
            "<team name> has uploaded the fully executed MTA for your request for"
            " <resource type>, <resource name> and is working to fulfill your request."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n<team name> has uploaded the fully executed MTA for your"
            " request for <resource type>, <resource name> and is working to fulfill your request."
            "\n\nView request details. ({request_url})."
        ),
        "attachments": ["MATERIAL_EXECUTED_MTA"],
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_REQUEST_REQUESTER_FULFILLED": {
        "subject": "Fulfilled: Request for <resource type>",
        "body": (
            "<team name> marked your request for <resource type>,"
            " <resource name> as fulfilled.\nPlease view fulfilment notes for details."
        ),
        "CTA": "View Request",
        "CTA_link_field": "associated_material_request",
        "plain_text_email": (
            "{your_name},\n<team name> marked your request for <resource type>,"
            " <resource name> as fulfilled.\nPlease view fulfilment notes for details. "
            "\n\nView fulfillment notes. ({request_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_material_request",
            "associated_organization",
        ],
    },
    "MATERIAL_ADDED": {
        "subject": "<team name>: New <resource type> added",
        "body": ("<Team Member> added a new <resource type>, <resource name> to <team name>."),
        "CTA": "View Resource",
        "CTA_link_field": "associated_material",
        "plain_text_email": (
            "{your_name},\n<Team Member> added a new <resource type>, <resource name> to <team name>."
            "\n\nView resource. ({resource_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_organization",
        ],
    },
    "MATERIAL_ARCHIVED": {
        "subject": "<team name>: <resource type> archived",
        "body": ("<Team Member> archived <resource type>, <resource name> from <team name>."),
        "CTA": "View Archived Resource",
        "CTA_link_field": "associated_material",
        "plain_text_email": (
            "{your_name},\n<Team Member> archived <resource type>, <resource name> from <team name>."
            "\n\nView archived resource. ({resource_url})."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_organization",
        ],
    },
    "MATERIAL_DELETED": {
        "subject": "<team name>:<resource type> deleted",
        "body": ("<Team Member> deleted <resource type>, <resource name> from <team name>."),
        "CTA": "YOU CAN'T DO ANYTHING ABOUT IT!",
        "CTA_link_field": "associated_material",
        "plain_text_email": (
            "{your_name},\n<Team Member> deleted <resource type>, <resource name> from <team name>."
        ),
        "required_associations": [
            "associated_user",
            "associated_material",
            "associated_organization",
        ],
    },
    "ORGANIZTION_NEW_MEMBER": {
        "subject": "<team name>: New member added",
        "body": ("<Team Member> was added to <team name>."),
        "CTA": "View Members",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},\n<Team Member> was added to <team name>."
            "\n\nView members. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
    },
    "ORGANIZTION_BECAME_OWNER": {
        "subject": "<team name>: You have been made owner",
        "body": (
            "<Old owner> has made you the owner of <team name>."
            "\nYou can now add new team members and remove members and resources."
        ),
        "CTA": "Manage Team",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},\n<Team Member> was added to <team name>."
            "\n\nManage team. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
    },
    "ORGANIZTION_NEW_OWNER": {
        "subject": "<team name>: New owner",
        "body": ("<Team Member> is now the owner of <team name>."),
        "CTA": "View Team",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},\n<Team Member> is now the owner of <team name>."
            "\n\nView team. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
    },
    "ORGANIZTION_MEMBER_LEFT": {
        "subject": "<team name>: Member left team",
        "body": ("<Team Member> left <team name>."),
        "CTA": "None?",
        "CTA_link_field": "associated_organization",
        "plain_text_email": ("{your_name},\n<Team Member> left <team name>"),
        "required_associations": ["associated_user", "associated_organization",],
    },
    "ORGANIZTION_NEW_GRANT": {
        "subject": "<team name>: New grant linked",
        "body": (
            "<Team Member> linked a new grant <Grant Name> with <team name>."
            "\nTeam members can now add resources associated with the grant."
        ),
        "CTA": "View Team Grants",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},<Team Member> linked a new grant <Grant Name> with <team name>. "
            "\nTeam members can now add resources associated with the grant."
            "\n\nView team grants. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
    },
    "ORGANIZATION_INVITE": {
        "subject": "You have been added to <team name>",
        "body": (" <Team Owner> has added you to their team, <team name>."),
        "CTA": "View Team",
        "CTA_link_field": "associated_organization",
        "plain_text_email": (
            "{your_name},<Team Owner> has added you to their team, <team name>."
            "\n\nView team. ({organization_url})."
        ),
        "required_associations": ["associated_user", "associated_organization",],
    },
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
