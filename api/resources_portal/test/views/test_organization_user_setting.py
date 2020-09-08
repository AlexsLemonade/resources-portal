from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import OrganizationUserSetting
from resources_portal.test.factories import (
    OrganizationUserSettingFactory,
    PersonalOrganizationFactory,
    UserFactory,
)

fake = Faker()


class TestSingleOrganizationUserSettingTestCase(APITestCase):
    """
    Tests /organization-user-setting detail operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.user.personal_organization = PersonalOrganizationFactory(owner=self.user)
        self.settings = OrganizationUserSettingFactory(
            user=self.user, organization=self.user.personal_organization
        )
        self.organization = self.settings.organization
        self.url = reverse("organization-user-setting-detail", args=[self.settings.id])
        self.different_user = UserFactory()

    def test_get_request_returns_a_users_settings(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_from_different_user_fails(self):
        self.client.force_authenticate(user=self.different_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_request_updates_settings(self):
        self.client.force_authenticate(user=self.user)
        settings_json = self.client.get(self.url).json()

        settings_json["weekly_digest"] = False

        response = self.client.put(self.url, settings_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        settings = OrganizationUserSetting.objects.get(pk=self.settings.id)
        self.assertEqual(settings.weekly_digest, False)

    def test_put_request_from_different_user_fails(self):
        self.client.force_authenticate(user=self.user)
        settings_json = self.client.get(self.url).json()

        self.client.force_authenticate(user=self.different_user)

        settings_json["weekly_digest"] = False

        response = self.client.put(self.url, settings_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=self.user)
        settings_json = self.client.get(self.url).json()

        self.client.force_authenticate(user=None)

        settings_json["weekly_digest"] = False

        response = self.client.put(self.url, settings_json)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_new_member_added_to_organization_creates_settings(self):
        self.client.force_authenticate(user=self.user)
        invitation_json = {
            "status": "ACCEPTED",
            "invite_or_request": "INVITE",
            "requester": self.user.id,
            "request_receiver": self.different_user.id,
            "organization": self.organization.id,
        }
        self.client.post(reverse("invitation-list"), invitation_json, format="json")

        self.assertTrue(
            OrganizationUserSetting.objects.filter(
                user=self.different_user, organization=self.organization
            ).exists()
        )

    def test_owner_has_settings_when_organization_created(self):
        self.assertTrue(
            OrganizationUserSetting.objects.filter(
                user=self.organization.owner, organization=self.organization
            ).exists()
        )
