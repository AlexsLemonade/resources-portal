import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from django.conf import settings

import boto3
import premailer

from resources_portal.config.logging import get_and_configure_logger

logging.getLogger("CSSUTILS").setLevel("CRITICAL")

logger = get_and_configure_logger(__name__)

EMAIL_SOURCE = (
    f"CCRR Portal <no-reply@{settings.AWS_SES_DOMAIN}>"
    if settings.AWS_SES_DOMAIN
    else "CCRR Portal"
)
NOTIFICATIONS_URL = f"https://{settings.AWS_SES_DOMAIN}/account/notifications/settings"
TERMS_OF_USE_URL = f"https://{settings.AWS_SES_DOMAIN}/terms-of-use"
ALEXS_LOGO_URL = f"https://{settings.AWS_SES_DOMAIN}/alexs-logo.png"
CCRR_LOGO_URL = f"https://{settings.AWS_SES_DOMAIN}/ccrr-logo.png"
# The blank line in this footer is intentional:
PLAIN_TEXT_EMAIL_FOOTER = """

The CCRR Team
-----
You are receiving this email because you subscribed to receive notifications from CCRR portal.
Manage Notifications ({notifications_url})
Alex's Lemonade Stand Foundation
111 Presidential Blvd, Suite 203, Bala Cynwyd,  PA 19004
""".format(
    notifications_url=NOTIFICATIONS_URL
)


def create_multipart_message(
    sender: str,
    recipients: list,
    title: str,
    text: str = None,
    html: str = None,
) -> MIMEMultipart:
    """
    Creates a MIME multipart message object.
    Taken from: https://stackoverflow.com/a/52105406/6095378
    Uses only the Python `email` standard library.
    Emails, both sender and recipients, can be just the email string or have the format 'The Name <the_email@host.com>'.

    :param sender: The sender.
    :param recipients: List of recipients. Needs to be a list, even if only one recipient.
    :param title: The title of the email.
    :param text: The text version of the email body (optional).
    :param html: The html version of the email body (optional).
    :return: A `MIMEMultipart` to be used to send the email.
    """
    multipart_content_subtype = "alternative" if text and html else "mixed"
    msg = MIMEMultipart(multipart_content_subtype)
    msg["Subject"] = title
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)

    # Record the MIME types of both parts - text/plain and text/html.
    # According to RFC 2046, the last part of a multipart message, in this case the HTML message, is best and preferred.
    if text:
        msg.attach(MIMEText(text, "plain"))
    if html:
        msg.attach(MIMEText(html, "html"))

    return msg


def send_mail(
    source: str,
    recipients: list,
    title: str,
    text: str = None,
    html: str = None,
) -> dict:
    """
    Send email to recipients. Sends one mail to all recipients.
    Taken from: https://stackoverflow.com/a/52105406/6095378
    The sender needs to be a verified email in SES.
    """
    inlined_html = None
    if html:
        inlined_html = premailer.transform(html)

    if settings.AWS_SES_DOMAIN:
        msg = create_multipart_message(source, recipients, title, text, inlined_html)
        ses_client = boto3.client("ses", region_name=settings.AWS_REGION)
        return ses_client.send_raw_email(
            Source=source, Destinations=recipients, RawMessage={"Data": msg.as_string()}
        )
    else:
        logger.debug(f'In prod the following message will be sent to "{recipients}": \n {text}')
