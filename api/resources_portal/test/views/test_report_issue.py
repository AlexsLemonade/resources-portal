from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Notification
from resources_portal.test.factories import (
    GrantFactory,
    MaterialRequestFactory,
    OrganizationFactory,
    UserFactory,
)

fake = Faker()


class ReportIssueTestCase(APITestCase):
    """
    Tests /address list operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.user.personal_organization = OrganizationFactory()
        self.user.organizations.add(OrganizationFactory())
        self.user.grants.add(GrantFactory())
        self.material_request = MaterialRequestFactory(requester=self.user)
        self.url = reverse("report-issue")

    def test_get(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_post_request_issue(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.url,
            {"message": "Why no give?", "material_request_id": self.material_request.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Notification.objects.all().count(), 1)
        self.assertEqual(
            Notification.objects.filter(
                notified_user=self.user, notification_type="MATERIAL_REQUEST_REQUESTER_ESCALATED"
            ).count(),
            1,
        )

    def test_post_general_issue(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {"message": "How do I even?"}, format="json",)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Notification.objects.all().count(), 1)
        self.assertEqual(
            Notification.objects.filter(
                notified_user=self.user, notification_type="REPORT_TO_GRANTS_TEAM"
            ).count(),
            1,
        )

    def test_post_malformed_fails(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
