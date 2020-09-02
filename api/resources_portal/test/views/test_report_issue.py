from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.test.factories import UserFactory

fake = Faker()


class ReportIssueTestCase(APITestCase):
    """
    Tests /address list operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.url = reverse("report-issue")

    def test_get(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_post(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {"message": "Why no give?"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_post_malformed_fails(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
