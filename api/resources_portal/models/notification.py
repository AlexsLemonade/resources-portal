from pathlib import Path

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from computedfields.models import ComputedFieldsModel, computed
from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.emailer import (
    ALEXS_LOGO_URL,
    CCRR_LOGO_URL,
    EMAIL_SOURCE,
    NOTIFICATIONS_URL,
    PLAIN_TEXT_EMAIL_FOOTER,
    TERMS_OF_USE_URL,
    send_mail,
)
from resources_portal.models.grant import Grant
from resources_portal.models.material import Material
from resources_portal.models.material_request import MaterialRequest
from resources_portal.models.material_request_issue import MaterialRequestIssue
from resources_portal.models.notifications_config import NOTIFICATION_CONFIGS
from resources_portal.models.organization import Organization
from resources_portal.models.user import User
from resources_portal.utils import pretty_date

logger = get_and_configure_logger(__name__)


EMAIL_HTML_BODY = (
    Path("resources_portal/email_assets/notification_email_template.html")
    .read_text()
    .replace("\n", "")
)
CTA_HTML = Path("resources_portal/email_assets/cta_template.html").read_text().replace("\n", "")


class Notification(SafeDeleteModel, ComputedFieldsModel):
    class Meta:
        db_table = "notifications"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    NOTIFICATION_TYPES = tuple((key, key) for key in NOTIFICATION_CONFIGS.keys())

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
        related_name="+",
    )
    organization = models.ForeignKey(Organization, blank=False, null=True, on_delete=models.CASCADE)
    grant = models.ForeignKey(Grant, blank=False, null=True, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, blank=False, null=True, on_delete=models.CASCADE)
    material_request = models.ForeignKey(
        MaterialRequest, blank=False, null=True, on_delete=models.CASCADE
    )
    material_request_issue = models.ForeignKey(
        MaterialRequestIssue, blank=False, null=True, on_delete=models.CASCADE
    )

    message = models.TextField(blank=False, null=True)
    email = models.EmailField(blank=False, null=True)
    email_delivered_at = models.DateTimeField(blank=False, null=True)

    def markdown(self):
        props = self.get_formatting_props()
        return NOTIFICATION_CONFIGS[self.notification_type]["markdown"].format(**props)

    @computed(models.BooleanField(blank=False, null=True))
    def email_delivered(self):
        return self.email_delivered_at is not None

    @property
    def human_readable_date(self):
        return pretty_date(self.created_at)

    def should_be_emailed(self):
        # Check instance.email_delivered to allow creating a notification
        # without triggering an email and to make sure we don't resend
        # notifications by accidentally saving them.
        return not self.email_delivered and (
            # If they want all notifications they get them.
            self.notified_user.receive_non_assigned_notifs
            or (
                # Otherwise we need to make sure they are the requester or assignee.
                self.material_request
                and (
                    self.notified_user == self.material_request.requester
                    or self.notified_user == self.material_request.assigned_to
                )
            )
            or (
                "always_send" in NOTIFICATION_CONFIGS[self.notification_type]
                and NOTIFICATION_CONFIGS[self.notification_type]["always_send"]
            )
            or (
                # Special case for this because it's always sent if
                # the user is the owner but not otherwise.
                self.notification_type == "ORGANIZATION_NEW_MEMBER"
                and self.notified_user == self.organization.owner
            )
        )

    def get_formatting_props(self):
        """
        All the properties which can be used in template strings in the
        config. If they don't get set because the association doesn't
        exist, then they better not be needed.
        """
        props = {
            "notifications_url": NOTIFICATIONS_URL,
            "message": self.message,
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
        if self.grant:
            props["grant_name"] = self.grant.title
        if self.organization:
            props["organization_name"] = self.organization.name
            props["organization_url"] = self.organization.frontend_URL
            props["organization_path"] = self.organization.frontend_path
            props["organization_owner"] = self.organization.owner.full_name
        if self.material:
            props["material_category"] = self.material.category
            props["material_name"] = self.material.title
            props["material_url"] = self.material.frontend_URL
            props["material_path"] = self.material.frontend_path
        if self.material_request:
            props["request_url"] = self.material_request.frontend_URL
            props["request_path"] = self.material_request.frontend_path
            props["requester_name"] = self.material_request.requester.full_name
            props["assigned_to"] = self.material_request.assigned_to.full_name
            props["rejection_reason"] = self.material_request.rejection_reason
            props["required_info_plain"] = self.material_request.required_info_plain_text
            props["provided_info_plain"] = self.material_request.provided_info_plain_text
            props["required_info_html"] = self.material_request.required_info_html
            props["provided_info_html"] = self.material_request.provided_info_html
        if self.material_request_issue:
            props["issue_description"] = self.material_request_issue.description

        return props

    def get_email_dict(self):
        props = self.get_formatting_props()

        notification_config = NOTIFICATION_CONFIGS[self.notification_type]

        body = notification_config["body"].format(**props)

        formatted_html = (
            EMAIL_HTML_BODY.replace("REPLACE_FULL_NAME", self.notified_user.full_name)
            .replace("REPLACE_MAIN_TEXT", body)
            .replace("REPLACE_ALEXS_LOGO", ALEXS_LOGO_URL)
            .replace("REPLACE_CCRR_LOGO", CCRR_LOGO_URL)
            .replace("REPLACE_NOTIFICATIONS_LINK", NOTIFICATIONS_URL)
            .replace("REPLACE_TERMS_LINK", TERMS_OF_USE_URL)
        )
        formatted_cta_html = ""
        cta = ""
        cta_link = ""
        if "CTA" in notification_config and "CTA_link_field" in notification_config:
            cta = notification_config["CTA"].format(**props)
            cta_link = getattr(self, notification_config["CTA_link_field"]).frontend_URL
            formatted_cta_html = CTA_HTML.replace("REPLACE_CTA", cta).replace(
                "REPLACE_LINK_CTA", cta_link
            )

        formatted_html = formatted_html.replace("REPLACE_HTML_CTA", formatted_cta_html)

        return {
            "body": body,
            "cta": cta,
            "cta_link": cta_link,
            "plain_text_email": (
                f"{self.notified_user.full_name},\n"
                + notification_config["plain_text_email"].format(**props)
                + PLAIN_TEXT_EMAIL_FOOTER
            ),
            "plain_text_email_body": (notification_config["plain_text_email"].format(**props)),
            "subject": notification_config["subject"].format(**props),
            "formatted_html": formatted_html,
        }


@receiver(pre_save, sender="resources_portal.Notification")
def validate_associations(sender, instance=None, created=False, **kwargs):
    if not instance.notification_type:
        raise ValidationError("Notifications must have notification_type set.")

    for association in NOTIFICATION_CONFIGS[instance.notification_type]["required_associations"]:
        if not getattr(instance, association):
            raise ValidationError(
                f"Notifications of type {instance.notification_type} must have {association} set."
            )


@receiver(post_save, sender="resources_portal.Notification")
def send_email_notification(sender, instance=None, created=False, **kwargs):
    if not (created and instance.should_be_emailed()):
        return

    if not instance.email:
        instance.email = instance.notified_user.email

    logger.info(f"Sending an email notification to {instance.email}.")
    email_dict = instance.get_email_dict()

    send_mail(
        EMAIL_SOURCE,
        [instance.email],
        email_dict["subject"],
        email_dict["plain_text_email"],
        email_dict["formatted_html"],
    )

    instance.delivered = True
    instance.save()
