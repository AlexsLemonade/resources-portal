import json
import os
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from django.conf import settings
from django.http import HttpResponse, HttpResponseForbidden
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import boto3

from resources_portal.config.logging import get_and_configure_logger

logger = get_and_configure_logger(__name__)

EMAIL_SOURCE_TEMPLATE = "Resources Portal Mail Robot <no-reply@{}>"
EMAIL_HTML_BODY = (
    Path("resources_portal/email_assets/resources-portal-email-templated-inlined.html")
    .read_text()
    .replace("\n", "")
)


def create_multipart_message(
    sender: str,
    recipients: list,
    title: str,
    text: str = None,
    html: str = None,
    attachments: list = None,
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
    :param attachments: List of files to attach in the email.
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
        part = MIMEText(text, "plain")
        msg.attach(part)
    if html:
        part = MIMEText(html, "html")
        msg.attach(part)

    # Add attachments
    for attachment in attachments or []:
        with open(attachment, "rb") as f:
            part = MIMEApplication(f.read())
            part.add_header(
                "Content-Disposition", "attachment", filename=os.path.basename(attachment)
            )
            msg.attach(part)

    return msg


def send_mail(
    sender: str,
    recipients: list,
    title: str,
    text: str = None,
    html: str = None,
    attachments: list = None,
) -> dict:
    """
    Send email to recipients. Sends one mail to all recipients.
    Taken from: https://stackoverflow.com/a/52105406/6095378
    The sender needs to be a verified email in SES.
    """
    msg = create_multipart_message(sender, recipients, title, text, html, attachments)
    ses_client = boto3.client("ses", region_name=settings.AWS_REGION)
    return ses_client.send_raw_email(
        Source=sender, Destinations=recipients, RawMessage={"Data": msg.as_string()}
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def email_invitation_view(request):
    json_data = json.loads(request.body)

    try:
        email = json_data["email"]
    except KeyError:
        return Response({"message": "Must specify 'email' in JSON."}, status=400)

    body = (
        f"{request.user.full_name} has invited you to create a CCRR account to help"
        f" them manage sharing resources. Please let them know once you create an account"
        f" so they can add you to the relevant teams."
    )
    if settings.AWS_SES_DOMAIN:
        cta = "Create an account"
        # TODO: Is this correct? Is there a special page to send them to?
        invitation_link = f"https://{settings.AWS_SES_DOMAIN}"
        formatted_html = (
            EMAIL_HTML_BODY.replace("REPLACE_MAIN_TEXT", body)
            .replace("REPLACE_CTA", cta)
            .replace("REPLACE_INVITATION_LINK", invitation_link)
        )
        subject = f"CCRR: {request.user.full_name} has invited you to create an account"
        source = EMAIL_SOURCE_TEMPLATE.format(settings.AWS_SES_DOMAIN)
        attachments = [
            "resources_portal/email_assets/ccrr-logo.svg",
            "resources_portal/email_assets/alexs-logo.svg",
        ]
        send_mail(source, email, subject, body, formatted_html, attachments)
    else:
        logger.info(f"In prod an email would have been sent to {email}:")
        print(body)

    return HttpResponse(status=status.HTTP_201_CREATED)
