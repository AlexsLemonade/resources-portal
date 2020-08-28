from resources_portal.models import (
    Material,
    MaterialRequest,
    MaterialRequestIssue,
    Notification,
    Organization,
    OrganizationInvitation,
    OrganizationUserSetting,
    User,
)
from resources_portal.models.notification_config import NOTIFICATIONS


def send_notifications(
    notification_type: str,
    associated_user: User,
    organization: Organization,
    material: Material = None,
    material_request: MaterialRequest = None,
    material_request_issue: MaterialRequestIssue = None,
):
    notification = Notification(
        notification_type=notification_type,
        notified_user=associated_user,
        associated_user=associated_user,
        associated_organization=organization,
        associated_material=material,
        associated_material_request=material_request,
        associated_material_request_issue=material_request_issue,
    )
    notification.save()
