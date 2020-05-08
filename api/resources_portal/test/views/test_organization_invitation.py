from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker
from guardian.shortcuts import assign_perm, remove_perm

from resources_portal.models import Notification, OrganizationInvitation
from resources_portal.test.factories import OrganizationInvitationFactory

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

        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_INVITE_CREATED")), 1
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

    def test_post_request_from_incorrect_user_fails(self):
        self.client.force_authenticate(user=None)
        self.client.login(
            username=self.invitation.requester.username, password=self.invitation.requester.password
        )
        response = self.client.post(self.url, self.invitation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

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
        Notification.objects.all().delete()

    def test_get_request_returns_a_given_invitation(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_request_approved_by_request_reciever_suceeds(self):
        self.client.force_authenticate(user=self.invitation.request_reciever)
        invitation_json = self.client.get(self.url).json()

        self.invitation.invite_or_request = "REQUEST"
        self.invitation.save()
        invitation_json["status"] = "ACCEPTED"

        invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

        response = self.client.put(self.url, invitation_json)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(invitation.requester in invitation.organization.members.all())
        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_REQUEST_ACCEPTED")), 1
        )

    def test_invite_approved_by_requester_suceeds(self):
        self.client.force_authenticate(user=self.invitation.requester)

        invitation_json = self.client.get(self.url).json()

        self.invitation.invite_or_request = "INVITE"
        self.invitation.save()
        invitation_json["status"] = "ACCEPTED"

        invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

        response = self.client.put(self.url, invitation_json)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(invitation.requester in invitation.organization.members.all())
        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_INVITE_ACCEPTED")), 1
        )

    def test_request_rejected_by_request_reciever_suceeds(self):
        self.client.force_authenticate(user=self.invitation.request_reciever)

        invitation_json = self.client.get(self.url).json()

        self.invitation.invite_or_request = "REQUEST"
        self.invitation.save()
        invitation_json["status"] = "REJECTED"

        invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

        response = self.client.put(self.url, invitation_json)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(invitation.requester in invitation.organization.members.all())
        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_REQUEST_REJECTED")), 1
        )

    def test_invite_rejected_by_requester_suceeds(self):
        self.client.force_authenticate(user=self.invitation.requester)

        invitation_json = self.client.get(self.url).json()

        self.invitation.invite_or_request = "INVITE"
        self.invitation.save()
        invitation_json["status"] = "REJECTED"

        invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

        response = self.client.put(self.url, invitation_json)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(invitation.requester in invitation.organization.members.all())
        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_INVITE_REJECTED")), 1
        )

    def test_request_invalid_suceeds(self):
        self.client.force_authenticate(user=self.invitation.request_reciever)

        invitation_json = self.client.get(self.url).json()

        self.invitation.invite_or_request = "REQUEST"
        self.invitation.save()
        invitation_json["status"] = "INVALID"

        invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

        response = self.client.put(self.url, invitation_json)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(invitation.requester in invitation.organization.members.all())
        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_REQUEST_INVALID")), 1
        )

    def test_invite_invalid_suceeds(self):
        self.client.force_authenticate(user=self.invitation.requester)

        invitation_json = self.client.get(self.url).json()

        self.invitation.invite_or_request = "INVITE"
        self.invitation.save()
        invitation_json["status"] = "INVALID"

        invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

        response = self.client.put(self.url, invitation_json)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(invitation.requester in invitation.organization.members.all())
        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_INVITE_INVALID")), 1
        )

    def test_put_request_from_wrong_user_fails(self):
        self.client.force_authenticate(user=self.invitation.requester)
        invitation_json = self.client.get(self.url).json()

        invitation_json["status"] = "ACCEPTED"
        self.invitation.invite_or_request = "REQUEST"
        self.invitation.save()

        response = self.client.put(self.url, invitation_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        invitation_json = self.client.get(self.url).json()

        invitation_json["status"] = "ACCEPTED"

        response = self.client.put(self.url, invitation_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
