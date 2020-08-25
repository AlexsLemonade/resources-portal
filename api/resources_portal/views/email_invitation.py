import json
from pathlib import Path

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.emailer import send_mail

logger = get_and_configure_logger(__name__)

EMAIL_SOURCE_TEMPLATE = "Resources Portal Mail Robot <no-reply@{}>"
EMAIL_HTML_BODY = (
    Path("resources_portal/email_assets/resources-portal-email-templated-inlined.html")
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
    if settings.AWS_SES_DOMAIN:
        cta = "Create an account"
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
        logger.info("Sending an email invitation to {email}.")
        send_mail(source, [email], subject, body, formatted_html, attachments)
    else:
        logger.info(f"In prod an email would have been sent to {email}:")
        print(body)

    return Response(status=status.HTTP_201_CREATED)
