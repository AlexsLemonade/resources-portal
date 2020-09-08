import json

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.emailer import send_mail

logger = get_and_configure_logger(__name__)

EMAIL_SOURCE_TEMPLATE = "Resources Portal Mail Robot <no-reply@{}>"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def report_issue_view(request):
    json_data = json.loads(request.body)

    try:
        message = json_data["message"]
    except KeyError:
        return Response({"message": "Must specify 'message' in JSON."}, status=400)

    grants_text = "\n    " + "\n    ".join(
        [f"{grant.title}: {grant.funder_id}" for grant in request.user.grants.all()]
    )
    organizations_text = "\n    " + "\n    ".join(
        [f"{org.name}" for org in request.user.organizations.all()]
    )
    body = (
        f"Dear Grants Team,\n\n"
        f"{request.user.full_name} is reporting an issue with a resource request in the"
        f" Resources Portal. The message they report is:\n\n---\n{message}\n---\n"
        f"\nADDITIONAL CONTEXT:\n"
        f"  Email:\n    {request.user.email}\n"
        f"  Grants:{grants_text}\n"
        f"  Organizations:{organizations_text}\n"
    )
    if settings.AWS_SES_DOMAIN:
        subject = f"CCRR: {request.user.full_name} is reporting an issue with a resource request"
        source = EMAIL_SOURCE_TEMPLATE.format(settings.AWS_SES_DOMAIN)
        logger.info("Sending an email invitation to {settings.GRANTS_TEAM_EMAIL}.")
        send_mail(source, [settings.GRANTS_TEAM_EMAIL], subject, body)
    else:
        logger.info(f"In prod an email would have been sent to {settings.GRANTS_TEAM_EMAIL}:")
        print(body)

    return Response(status=status.HTTP_201_CREATED)
