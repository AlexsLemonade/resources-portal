import datetime
from urllib.parse import quote_plus

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.test.factories import NotificationFactory, UserFactory

fake = Faker()


class NotificationsTestCase(APITestCase):
    """
    Tests /users/<id>/notifications operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.owned_notification = NotificationFactory(notified_user=self.user)
        self.unowned_notification = NotificationFactory()

        self.user_without_perms = UserFactory()
        self.url = reverse("notifications-list", args=[self.user.id])

    def test_get_single(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("notifications-detail", args=[self.user.id, self.owned_notification.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_returns_owned_notifications(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_filters_by_created_at(self):
        self.client.force_authenticate(user=self.user)
        two_days_ago = timezone.now() - datetime.timedelta(days=2)
        yesterday = timezone.now() - datetime.timedelta(days=1)

        self.owned_notification = NotificationFactory(notified_user=self.user)
        self.owned_notification.created_at = two_days_ago
        self.owned_notification.save()

        yesterday_str = quote_plus(yesterday.isoformat("T", "seconds"))
        response = self.client.get(self.url + "?created_at__lt=" + yesterday_str)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_wrong_user_returns_none(self):
        self.client.force_authenticate(user=self.user_without_perms)
        url = reverse("notifications-list", args=[self.user_without_perms.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 0)

    def test_post_is_not_allowed(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("notifications-list", args=[self.user.id])
        response = self.client.post(url, data={})

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put_is_not_allowed(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("notifications-detail", args=[self.user.id, self.owned_notification.id])
        response = self.client.put(url, data={})

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_is_not_allowed(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("notifications-detail", args=[self.user.id, self.owned_notification.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
