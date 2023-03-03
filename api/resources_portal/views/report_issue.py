import json

from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.emailer import EMAIL_SOURCE, send_mail
from resources_portal.models import MaterialRequest, Notification

logger = get_and_configure_logger(__name__)


def get_grants_text(request):
    return "\n    " + "\n    ".join(
        [f"{grant.title}: {grant.funder_id}" for grant in request.user.grants.all()]
    )


def get_organizations_text(request):
    return "\n    " + "\n    ".join([f"{org.name}" for org in request.user.organizations.all()])


def get_request_issue_report_email(request, message, material_request):
    grants_text = get_grants_text(request)
    organizations_text = get_organizations_text(request)
    body = (
        f"Dear Grants Team,\n\n"
        f"{request.user.full_name} is reporting an issue with a resource request in the"
        f" Resources Portal. The message they report is:\n\n---\n{message}\n---\n"
        f"\nADDITIONAL CONTEXT:\n"
        f"  Email:\n    {request.user.email}\n"
        f"  Request: {material_request.frontend_URL}"
        f"  Grants:{grants_text}\n"
        f"  Organizations:{organizations_text}\n"
    )

    subject = f"CCRR Portal: {request.user.full_name} is reporting an issue with a resource request"
    return {"body": body, "subject": subject}


def get_general_issue_report_email(request, message):
    grants_text = get_grants_text(request)
    organizations_text = get_organizations_text(request)
    body = (
        f"Dear Grants Team,\n\n"
        f"{request.user.full_name} is reporting an issue in the"
        f" Resources Portal. The message they report is:\n\n---\n{message}\n---\n"
        f"\nADDITIONAL CONTEXT:\n"
        f"  Email:\n    {request.user.email}\n"
        f"  Grants:{grants_text}\n"
        f"  Organizations:{organizations_text}\n"
    )

    subject = f"CCRR Portal: {request.user.full_name} is reporting an issue"
    return {"body": body, "subject": subject}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def report_issue_view(request):
    json_data = json.loads(request.body)

    try:
        message = json_data["message"]
    except KeyError:
        return Response({"message": "Must specify 'message' in JSON."}, status=400)

    material_request = None
    material = None
    notification_type = "REPORT_TO_GRANTS_TEAM"
    if "material_request_id" in json_data:
        notification_type = "MATERIAL_REQUEST_REQUESTER_ESCALATED"
        material_request = MaterialRequest.objects.get(id=json_data["material_request_id"])
        material = material_request.material

    if material_request:
        email_text = get_request_issue_report_email(request, message, material_request)
    else:
        email_text = get_general_issue_report_email(request, message)

    logger.info("Sending an email invitation to {settings.GRANTS_TEAM_EMAIL}.")
    send_mail(EMAIL_SOURCE, [settings.GRANTS_TEAM_EMAIL], email_text["subject"], email_text["body"])

    notification = Notification(
        notification_type=notification_type,
        message=message,
        notified_user=request.user,
        associated_user=request.user,
        organization=request.user.personal_organization,
        material=material,
        material_request=material_request,
    )
    notification.save()

    return JsonResponse({}, status=status.HTTP_201_CREATED)
