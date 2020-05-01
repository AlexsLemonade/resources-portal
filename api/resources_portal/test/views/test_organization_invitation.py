from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker
from guardian.shortcuts import assign_perm, remove_perm

from resources_portal.models import OrganizationInvitation, User
from resources_portal.test.factories import (
    OrganizationFactory,
    OrganizationInvitationFactory,
    UserFactory,
)

fake = Faker()


class OrganizationInvitationListTestCase(APITestCase):
    """
    Tests /invitations list operations.
    """

    def setUp(self):
        self.url = reverse("invitation-list")
        self.invitation = OrganizationInvitationFactory()
        self.invitation_data = model_to_dict(self.invitation)
        self.client.force_authenticate(user=self.invitation.requester)

    def test_post_request_with_no_data_fails(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        response = self.client.post(self.url, self.invitation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(
            str(self.invitation_data["request_reciever"]), response.json()["request_reciever"]
        )

    def test_post_request_with_invalid_permissions_fails(self):
        remove_perm(
            "add_members_and_manage_permissions",
            self.invitation.request_reciever,
            self.invitation.organization,
        )
        response = self.client.post(self.url, self.invitation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        assign_perm(
            "add_members_and_manage_permissions",
            self.invitation.request_reciever,
            self.invitation.organization,
        )

    def test_post_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.invitation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TestSingleOrganizationInvitationTestCase(APITestCase):
    """
    Tests /invitations detail operations.
    """

    def setUp(self):
        self.invitation = OrganizationInvitationFactory()
        self.url = reverse("invitation-detail", args=[self.invitation.id])
        self.client.force_authenticate(user=self.invitation.requester)

    def test_get_request_returns_a_given_invitation(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_an_invitation(self):
        invitation_json = self.client.get(self.url).json()

        invitation_json["status"] = "ACCEPTED"

        response = self.client.put(self.url, invitation_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)
        self.assertEqual(invitation.status, "ACCEPTED")

    def test_put_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        invitation_json = self.client.get(self.url).json()

        invitation_json["status"] = "ACCEPTED"

        response = self.client.put(self.url, invitation_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
