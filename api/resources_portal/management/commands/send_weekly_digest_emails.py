import datetime
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils import timezone

from resources_portal.emailer import (
    EMAIL_SOURCE,
    LOGO_EMBEDDED_IMAGE_CONFIGS,
    NOTIFICATIONS_URL,
    PLAIN_TEXT_EMAIL_FOOTER,
    send_mail,
)
from resources_portal.models import User

EMAIL_HTML_TEMPLATE = (
    Path("resources_portal/email_assets/weekly_email_template_inlined.html")
    .read_text()
    .replace("\n", "")
)
EMAIL_HTML_LIST_ITEM = (
    Path("resources_portal/email_assets/replace_notification_list_inlined.html")
    .read_text()
    .replace("\n", "")
)
CTA_HTML = (
    Path("resources_portal/email_assets/cta_templated_inlined.html").read_text().replace("\n", "")
)


def get_plain_text_for_notif(notification):
    email_dict = notification.get_email_dict()
    plain_text_email_body = email_dict["plain_text_email_body"]

    return f"{notification.human_readable_date}\n{plain_text_email_body}\n"


def get_formatted_text_for_notif(notification):
    pass


def send_user_weekly_digest(user):
    start_time = user.weekly_digest_last_sent

    if not start_time:
        start_time = timezone.now() - datetime.timedelta(days=7)

    notifications = user.notifications.filter(created_at__gte=start_time)

    pretty_start_time = start_time.strftime("%Y-%m-%d")
    intro_line = f"You received {notifications.count()} for the week of {pretty_start_time}"
    plain_text = f"{user.full_name},\n{intro_line}.\n--\n"

    for notification in notifications:
        plain_text += plain_text + get_plain_text_for_notif(notification)

    plain_text += PLAIN_TEXT_EMAIL_FOOTER


def send_weekly_digests():
    for user in User.objects.filter(receive_weekly_digest=True):
        send_user_weekly_digest(user)


class Command(BaseCommand):
    help = "Sends weekly digest emails to everyone who wants them."

    def handle(self, *args, **options):
        send_weekly_digests()
