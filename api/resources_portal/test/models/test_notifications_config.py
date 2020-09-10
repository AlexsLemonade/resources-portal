from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models.notifications_config import NOTIFICATIONS
from resources_portal.test.factories import NotificationFactory

fake = Faker()


class NotificationEmailFormattingTestCase(APITestCase):
    """
    Tests email formatting for notifications.
    """

    def setUp(self):
        self.notification = NotificationFactory()

    def test_all_notification_type_formatting(self):
        for notification_type in NOTIFICATIONS.keys():
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
        self.notification.notification_type = "ORGANIZATION_NEW_MEMBER"
        self.notification.material = None
        self.notification.save()

        # Lack of exception means it was ok!
