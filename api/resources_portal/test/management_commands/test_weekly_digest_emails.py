import datetime
from unittest.mock import patch

from django.utils import timezone
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.management.commands.send_weekly_digest_emails import send_weekly_digests
from resources_portal.models import Grant, User
from resources_portal.test.factories import (
    GrantFactory,
    NotificationFactory,
    PersonalOrganizationFactory,
    UserFactory,
)

fake = Faker()


class TestWeeklyDigests(APITestCase):
    """
    Tests that the weekly digest emails get created correctly.
    """

    @patch("resources_portal.management.commands.send_weekly_digest_emails.send_mail")
    def test_user_receives_correct_notications(self, mock_send_mail):
        user = UserFactory()
        NotificationFactory(notified_user=user)
        NotificationFactory(notified_user=user)
        notification3 = NotificationFactory(notified_user=user)
        notification3.created_at = timezone.now() - datetime.timedelta(days=10)
        notification3.save()

        # No notifications. Won't be notified.
        UserFactory()

        send_weekly_digests()

        mock_send_mail.assert_called_once()
        mock_call_args = mock_send_mail.mock_calls[0][1]

        recipients = mock_call_args[1]
        self.assertEqual(recipients, [user.email])
        plain_text = mock_call_args[3]
        self.assertIn("You received 2 notifications for the week of", plain_text)
