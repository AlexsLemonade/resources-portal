from resources_portal.models import (
    Material,
    Notification,
    Organization,
    OrganizationInvitation,
    OrganizationUserSetting,
    User,
)


def send_notifications(
    notification_type: str,
    associated_user: User,
    organization: Organization,
    material: Material = None,
):
    notification = Notification(
        notification_type=notification_type,
        notified_user=associated_user,
        associated_user=associated_user,
        associated_organization=organization,
    )
    notification.save()
