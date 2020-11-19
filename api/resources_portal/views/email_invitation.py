import json
from pathlib import Path

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.emailer import (
    ALEXS_LOGO_URL,
    CCRR_LOGO_URL,
    EMAIL_SOURCE,
    PLAIN_TEXT_EMAIL_FOOTER,
    send_mail,
)

logger = get_and_configure_logger(__name__)

EMAIL_HTML_BODY = (
    Path("resources_portal/email_assets/invitation_email_template.html")
    .read_text()
    .replace("\n", "")
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
    invitation_link = f"https://{settings.AWS_SES_DOMAIN}"
    terms_of_use_link = f"https://{settings.AWS_SES_DOMAIN}/terms-of-use"

    formatted_html = (
        EMAIL_HTML_BODY.replace("REPLACE_MAIN_TEXT", body)
        .replace("REPLACE_CTA_LINK", invitation_link)
        .replace("REPLACE_TERMS_LINK", terms_of_use_link)
        .replace("REPLACE_ALEXS_LOGO", ALEXS_LOGO_URL)
        .replace("REPLACE_CCRR_LOGO", CCRR_LOGO_URL)
    )
    plain_text_email = body + PLAIN_TEXT_EMAIL_FOOTER
    subject = f"CCRR: {request.user.full_name} has invited you to create an account"

    logger.info(f"Sending an email invitation to {email}.")
    send_mail(
        EMAIL_SOURCE, [email], subject, plain_text_email, formatted_html,
    )

    return Response(status=status.HTTP_201_CREATED)
