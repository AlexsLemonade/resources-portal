from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models.email_notifications_config import EMAIL_NOTIFICATIONS
from resources_portal.test.factories import NotificationFactory, OrganizationFactory

fake = Faker()


class NotificationEmailFormattingTestCase(APITestCase):
    """
    Tests email formatting for notifications.
    """

    def setUp(self):
        self.notification = NotificationFactory()

    def test_all_notification_type_formatting(self):
        for notification_type in EMAIL_NOTIFICATIONS.keys():
            self.notification.notification_type = notification_type
            self.notification.email_delivered = False
            self.notification.save()
            email_dict = self.notification.get_email_dict()

            # We format the html different than the other fields.
            self.assertNotIn("REPLACE_", email_dict.pop("formatted_html"))

            for _, formatted_text in email_dict.items():
                self.assertNotIn("{", formatted_text)
                self.assertNotIn("}", formatted_text)

    def test_missing_required_field_errors(self):
        with self.assertRaises(ValidationError):
            self.notification.notification_type = "MATERIAL_ADDED"
            self.notification.material = None
            self.notification.save()

    def test_missing_non_required_field_ok(self):
        # This will actually trigger the send_email function.
        organization = OrganizationFactory()

        notification = NotificationFactory(
            notification_type="ORGANIZATION_NEW_MEMBER",
            material=None,
            organization=organization,
            notified_user=organization.owner,
        )

        # Lack of exception means it was ok!
