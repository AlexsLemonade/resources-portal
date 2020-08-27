from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from computedfields.models import ComputedFieldsModel
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
from resources_portal.models.grant import Grant
from resources_portal.models.material import Material
from resources_portal.models.material_request import MaterialRequest
from resources_portal.models.material_request_issue import MaterialRequestIssue
from resources_portal.models.notifications_config import NOTIFICATIONS
from resources_portal.models.organization import Organization
from resources_portal.models.user import User

logger = get_and_configure_logger(__name__)


EMAIL_HTML_BODY = (
    Path("resources_portal/email_assets/notification-email-templated-inlined.html")
    .read_text()
    .replace("\n", "")
)


class Notification(SafeDeleteModel):
    class Meta:
        db_table = "notifications"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    NOTIFICATION_TYPES = tuple((key, key) for key in NOTIFICATIONS.keys())

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)

    notification_type = models.CharField(max_length=64, choices=NOTIFICATION_TYPES)
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
    associated_grant = models.ForeignKey(Grant, blank=False, null=True, on_delete=models.CASCADE)
    associated_material = models.ForeignKey(
        Material, blank=False, null=True, on_delete=models.CASCADE
    )
    associated_material_request = models.ForeignKey(
        MaterialRequest, blank=False, null=True, on_delete=models.CASCADE
    )
    associated_material_request_issue = models.ForeignKey(
        MaterialRequestIssue, blank=False, null=True, on_delete=models.CASCADE
    )

    email = models.EmailField(blank=False, null=True)

    delivered = models.BooleanField(default=False)

    def should_be_emailed(self):
        # Check instance.delivered to allow creating a notification
        # without triggering an email and to make sure we don't resend
        # notifications by accidentally saving them.
        return not self.delivered and (
            # If they want all notifications they get them.
            self.notified_user.receive_non_assigned_notifs
            or (
                # Otherwise we need to make sure they are the requester or assignee.
                self.associated_material_request
                and (
                    self.notified_user == self.associated_material_request.requester
                    or self.notified_user == self.associated_material_request.assigned_to
                )
            )
        )

    def get_email_dict(self):
        # All the properties which can be used in template strings in the
        # config. If they don't get set because the association doesn't
        # exist, then they better not be needed.
        props = {
            "notifications_url": NOTIFICATIONS_URL,
            "your_name": self.notified_user.full_name,
        }
        if self.associated_user:
            props["other_name"] = self.associated_user.full_name
            if self.associated_user == self.notified_user:
                props["you_or_other_name"] = "you"
                props["you_or_other_name_upper"] = "You"
            else:
                props["you_or_other_name"] = self.associated_user.full_name
                props["you_or_other_name_upper"] = self.associated_user.full_name
            props["you_or_other_name"] = self.associated_user.full_name
        if self.associated_grant:
            props["grant_name"] = self.associated_grant.title
        if self.associated_organization:
            props["organization_name"] = self.associated_organization.name
            props["organization_url"] = self.associated_organization.frontend_URL
            props["organization_owner"] = self.associated_organization.owner.full_name
        if self.associated_material:
            props["material_category"] = self.associated_material.category
            props["material_name"] = self.associated_material.title
            props["material_url"] = self.associated_material.frontend_URL
        if self.associated_material_request:
            props["request_url"] = self.associated_material_request.frontend_URL
            props["requester_name"] = self.associated_material_request.requester.full_name
            props["required_info"] = self.associated_material_request.required_information_text
            props["provided_info"] = self.associated_material_request.provided_information_text
        if self.associated_material_request_issue:
            props["issue_description"] = self.associated_material_request_issue.description

        notification_config = NOTIFICATIONS[self.notification_type]

        body = notification_config["body"].format(**props)
        cta = notification_config["CTA"].format(**props)
        cta_link = getattr(self, notification_config["CTA_link_field"]).frontend_URL

        return {
            "body": body,
            "cta": cta,
            "cta_link": cta_link,
            "plain_text_email": (
                notification_config["plain_text_email"].format(**props) + PLAIN_TEXT_EMAIL_FOOTER
            ),
            "subject": notification_config["subject"].format(**props),
            "formatted_html": (
                EMAIL_HTML_BODY.replace("REPLACE_MAIN_TEXT", body)
                .replace("REPLACE_CTA", cta)
                .replace("REPLACE_INVITATION_LINK", cta_link)
            ),
        }


@receiver(pre_save, sender="resources_portal.Notification")
def validate_associations(sender, instance=None, created=False, **kwargs):
    if not instance.notification_type:
        raise ValidationError("Notifications must have notification_type set.")

    for association in NOTIFICATIONS[instance.notification_type]["required_associations"]:
        if not getattr(instance, association):
            raise ValidationError(
                f"Notifications of type {instance.notification_type} must have {association} set."
            )


@receiver(post_save, sender="resources_portal.Notification")
def send_email_notification(sender, instance=None, created=False, **kwargs):
    if not (created and instance.should_be_emailed()):
        return

    email_dict = instance.get_email_dict()
    logger.info("Sending an email notification to {email}.")

    if settings.AWS_SES_DOMAIN:
        send_mail(
            EMAIL_SOURCE,
            [instance.notified_email],
            email_dict["subject"],
            email_dict["plain_text_email"],
            email_dict["formatted_html"],
            LOGO_EMBEDDED_IMAGE_CONFIGS,
        )
    else:
        logger.info(
            f'In prod the following message will be sent to "{instance.notified_user.email}": "'
            f'{email_dict["plain_text_email"]}".'
        )
