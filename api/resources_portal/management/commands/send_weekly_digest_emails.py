import datetime
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone

from resources_portal import utils
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
from resources_portal.models import User

logger = get_and_configure_logger(__name__)

EMAIL_HTML_TEMPLATE = (
    Path("resources_portal/email_assets/weekly_email_template.html").read_text().replace("\n", "")
)
EMAIL_HTML_LIST_ITEM = (
    Path("resources_portal/email_assets/replace_notification_list.html")
    .read_text()
    .replace("\n", "")
)
CTA_HTML = Path("resources_portal/email_assets/cta_template.html").read_text().replace("\n", "")


def get_plain_text_for_notification(notification):
    email_dict = notification.get_email_dict()
    plain_text_email_body = email_dict["plain_text_email_body"]

    return f"{notification.human_readable_date}\n{plain_text_email_body}\n"


def get_formatted_text_for_notification(notification):
    email_dict = notification.get_email_dict()
    pretty_time = utils.pretty_date(notification.created_at)

    formatted_text = EMAIL_HTML_LIST_ITEM.replace("REPLACE_BODY", email_dict["body"]).replace(
        "REPLACE_DATE", pretty_time
    )

    if email_dict["cta"]:
        formatted_text += CTA_HTML.replace("REPLACE_CTA", email_dict["cta"]).replace(
            "REPLACE_LINK_CTA", email_dict["cta_link"]
        )

    return formatted_text


def send_user_weekly_digest(user):
    start_time = user.weekly_digest_last_sent
    if not start_time:
        start_time = timezone.now() - datetime.timedelta(days=7)

    pretty_start_time = start_time.strftime("%Y-%m-%d")
    notifications = user.notifications.filter(created_at__gte=start_time)

    if notifications.count() < 1:
        logger.info(f"No notifications for user: {user.full_name} this week!")
        return

    intro_line = (
        f"You received {notifications.count()} notifications for the week of {pretty_start_time}"
    )
    plain_text = f"{user.full_name},\n{intro_line}.\n--\n"

    html_body_list = ""

    for notification in notifications:
        plain_text += get_plain_text_for_notification(notification)
        html_body_list += get_formatted_text_for_notification(notification)

    plain_text += PLAIN_TEXT_EMAIL_FOOTER

    html_body = (
        EMAIL_HTML_TEMPLATE.replace("REPLACE_NAME", user.full_name)
        .replace("REPLACE_INTRO_LINE", intro_line)
        .replace("REPLACE_NOTIFICATION_LIST", html_body_list)
        .replace("REPLACE_ALEXS_LOGO", ALEXS_LOGO_URL)
        .replace("REPLACE_CCRR_LOGO", CCRR_LOGO_URL)
        .replace("REPLACE_NOTIFICATIONS_LINK", NOTIFICATIONS_URL)
        .replace("REPLACE_TERMS_LINK", TERMS_OF_USE_URL)
    )

    subject = "ALSF CCRR: Weekly Notification Digest"

    send_mail(EMAIL_SOURCE, [user.email], subject, plain_text, html_body)

    user.weekly_digest_last_sent = timezone.now()
    user.save()


def send_weekly_digests():
    for user in User.objects.filter(receive_weekly_digest=True):
        send_user_weekly_digest(user)


class Command(BaseCommand):
    help = "Sends weekly digest emails to everyone who wants them."

    def handle(self, *args, **options):
        send_weekly_digests()
