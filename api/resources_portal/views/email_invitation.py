import json
from pathlib import Path

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.emailer import (
    EMAIL_SOURCE,
    LOGO_EMBEDDED_IMAGE_CONFIGS,
    PLAIN_TEXT_EMAIL_FOOTER,
    send_mail,
)

logger = get_and_configure_logger(__name__)

EMAIL_HTML_BODY = (
    Path("resources_portal/email_assets/invitation_email_templated_inlined.html")
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
    cta = "Create an account"
    invitation_link = f"https://{settings.AWS_SES_DOMAIN}"
    formatted_html = (
        EMAIL_HTML_BODY.replace("REPLACE_MAIN_TEXT", body)
        .replace("REPLACE_CTA", cta)
        .replace("REPLACE_INVITATION_LINK", invitation_link)
    )
    plain_text_email = body + PLAIN_TEXT_EMAIL_FOOTER
    subject = f"CCRR: {request.user.full_name} has invited you to create an account"

    logger.info("Sending an email invitation to {email}.")
    send_mail(
        EMAIL_SOURCE,
        [email],
        subject,
        plain_text_email,
        formatted_html,
        LOGO_EMBEDDED_IMAGE_CONFIGS,
    )

    return Response(status=status.HTTP_201_CREATED)
