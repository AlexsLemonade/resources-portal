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

    # Default to sending to primary user.
    if (
        "send_to_primary_user" not in notification_config
        or notification_config["send_to_primary_user"]
    ):
        notification = Notification(
            notification_type=notification_type,
            notified_user=primary_user,
            associated_user=associated_user,
            associated_organization=organization,
            associated_material=material,
            associated_material_request=material_request,
            associated_material_request_issue=material_request_issue,
        )
        notification.save()

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
            members.exclude(associated_user)

        for member in members.all():
            notification = Notification(
                notification_type=notification_type,
                notified_user=member,
                associated_user=associated_user,
                associated_organization=organization,
                associated_material=material,
                associated_material_request=material_request,
                associated_material_request_issue=material_request_issue,
            )
            notification.save()
