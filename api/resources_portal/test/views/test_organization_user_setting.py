from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import OrganizationUserSetting
from resources_portal.test.factories import (
    OrganizationInvitationFactory,
    OrganizationUserSettingFactory,
    UserFactory,
)

fake = Faker()


class TestSingleOrganizationUserSettingTestCase(APITestCase):
    """
    Tests /organization-user-setting detail operations.
    """

    def setUp(self):
        self.settings = OrganizationUserSettingFactory()
        self.user = self.settings.user
        self.organization = self.settings.organization
        self.url = reverse("organization-user-setting-detail", args=[self.settings.id])
        self.different_user = UserFactory()

        self.invitation = OrganizationInvitationFactory(
            requester=self.different_user, organization=self.organization
        )
        self.invitation_url = reverse("invitation-detail", args=[self.invitation.id])

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
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_updates_settings(self):
        self.client.force_authenticate(user=self.user)
        settings_json = self.client.get(self.url).json()

        settings_json["new_request_notif"] = False
        settings_json["change_in_request_status_notif"] = False

        settings_json["user"] = settings_json["user"]
        settings_json["organization"] = settings_json["organization"]

        response = self.client.put(self.url, settings_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        settings = OrganizationUserSetting.objects.get(pk=self.settings.id)
        self.assertEqual(settings.new_request_notif, False)
        self.assertEqual(settings.change_in_request_status_notif, False)

    def test_put_request_from_different_user_fails(self):
        self.client.force_authenticate(user=self.user)
        settings_json = self.client.get(self.url).json()

        self.client.force_authenticate(user=self.different_user)

        settings_json["new_request_notif"] = False
        settings_json["change_in_request_status_notif"] = False

        response = self.client.put(self.url, settings_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=self.user)
        settings_json = self.client.get(self.url).json()

        self.client.force_authenticate(user=None)

        settings_json["new_request_notif"] = False
        settings_json["change_in_request_status_notif"] = False

        response = self.client.put(self.url, settings_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_new_member_added_to_organization_creates_settings(self):
        self.client.force_authenticate(user=self.invitation.requester)
        invitation_json = self.client.get(self.invitation_url).json()
        invitation_json["status"] = "ACCEPTED"
        response = self.client.put(self.invitation_url, invitation_json)

        self.assertTrue(
            OrganizationUserSetting.objects.filter(
                user=self.different_user, organization=self.invitation.organization
            ).exists()
        )

    def test_owner_has_settings_when_organization_created(self):
        self.assertTrue(
            OrganizationUserSetting.objects.filter(
                user=self.organization.owner, organization=self.organization
            ).exists()
        )
