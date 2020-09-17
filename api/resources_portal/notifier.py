from resources_portal.models import (
    Material,
    MaterialRequest,
    MaterialRequestIssue,
    Notification,
    Organization,
    User,
)
from resources_portal.models.notifications_config import NOTIFICATIONS


def send_notifications(
    notification_type: str,
    primary_user: User,
    associated_user: User,
    # I think organization might need to be optional...
    organization: Organization,
    material: Material = None,
    material_request: MaterialRequest = None,
    material_request_issue: MaterialRequestIssue = None,
):
    notification_config = NOTIFICATIONS[notification_type]
    recipients = set()

    # If send_to_associated_user = False, and the primary user is the
    # associated user, then they shouldn't be notified.
    block_primary_user = False
    if (
        "send_to_organization" in notification_config
        and notification_config["send_to_organization"]
    ):
        members = organization.members

        if (
            "send_to_associated_user" in notification_config
            and not notification_config["send_to_associated_user"]
            and associated_user
        ):
            members = members.exclude(id=associated_user.id)

            if associated_user == primary_user:
                block_primary_user = True

        recipients = recipients | set(members.all())

    # Default to sending to primary user.
    if block_primary_user:
        recipients = recipients - set([primary_user])
    elif (
        "send_to_primary_user" not in notification_config
        or notification_config["send_to_primary_user"]
    ):
        recipients = recipients | set([primary_user])
    else:
        recipients = recipients - set([primary_user])

    for recipient in recipients:
        notification = Notification(
            notification_type=notification_type,
            notified_user=recipient,
            associated_user=associated_user,
            organization=organization,
            material=material,
            material_request=material_request,
            material_request_issue=material_request_issue,
        )
        notification.save()
