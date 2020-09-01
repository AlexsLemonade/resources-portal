from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker
from guardian.shortcuts import remove_perm

from resources_portal.models import Notification
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
            str(self.invitation_data["request_receiver"]), response.json()["request_receiver"]
        )

        # The new and old members are all notified.
        num_members = self.invitation.organization.members.count()
        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORGANIZATION_NEW_MEMBER")),
            num_members,
        )

        self.assertIn(self.invitation.request_receiver, self.invitation.organization.members.all())

    def test_post_request_with_invalid_permissions_fails(self):
        remove_perm(
            "add_members", self.invitation.requester, self.invitation.organization,
        )
        response = self.client.post(self.url, self.invitation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_request_from_incorrect_user_fails(self):
        self.client.force_authenticate(user=None)
        self.client.login(
            username=self.invitation.requester.username, password=self.invitation.requester.password
        )
        response = self.client.post(self.url, self.invitation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.invitation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# We don't yet need these methods
# class TestSingleOrganizationInvitationTestCase(APITestCase):
#     """
#     Tests /invitations detail operations.
#     """

#     def setUp(self):
#         self.invitation = OrganizationInvitationFactory()
#         self.url = reverse("invitation-detail", args=[self.invitation.id])
#         Notification.objects.all().delete()

#     def test_get_request_returns_a_given_invitation(self):
#         response = self.client.get(self.url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

# def test_request_approved_by_request_receiver_suceeds(self):
#     self.client.force_authenticate(user=self.invitation.request_receiver)
#     invitation_json = self.client.get(self.url).json()

#     self.invitation.invite_or_request = "REQUEST"
#     self.invitation.save()
#     invitation_json["status"] = "ACCEPTED"

#     invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

#     response = self.client.put(self.url, invitation_json)

#     self.assertEqual(response.status_code, status.HTTP_200_OK)
#     self.assertTrue(invitation.requester in invitation.organization.members.all())
#     self.assertEqual(
#         len(
#             Notification.objects.filter(
#                 notification_type="ORG_REQUEST_ACCEPTED", email=self.invitation.requester.email
#             )
#         ),
#         1,
#     )

# def test_invite_approved_by_requester_suceeds(self):
#     self.client.force_authenticate(user=self.invitation.requester)

#     invitation_json = self.client.get(self.url).json()

#     self.invitation.invite_or_request = "INVITE"
#     self.invitation.save()
#     invitation_json["status"] = "ACCEPTED"

#     invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

#     response = self.client.put(self.url, invitation_json)

#     self.assertEqual(response.status_code, status.HTTP_200_OK)
#     self.assertTrue(invitation.requester in invitation.organization.members.all())
#     self.assertEqual(
#         len(
#             Notification.objects.filter(
#                 notification_type="ORG_INVITE_ACCEPTED",
#                 email=self.invitation.request_receiver.email,
#             )
#         ),
#         1,
#     )

# def test_request_rejected_by_request_receiver_suceeds(self):
#     self.client.force_authenticate(user=self.invitation.request_receiver)

#     invitation_json = self.client.get(self.url).json()

#     self.invitation.invite_or_request = "REQUEST"
#     self.invitation.save()
#     invitation_json["status"] = "REJECTED"

#     invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

#     response = self.client.put(self.url, invitation_json)

#     self.assertEqual(response.status_code, status.HTTP_200_OK)
#     self.assertFalse(invitation.requester in invitation.organization.members.all())
#     self.assertEqual(
#         len(
#             Notification.objects.filter(
#                 notification_type="ORG_REQUEST_REJECTED", email=self.invitation.requester.email
#             )
#         ),
#         1,
#     )

# def test_invite_rejected_by_requester_suceeds(self):
#     self.client.force_authenticate(user=self.invitation.requester)

#     invitation_json = self.client.get(self.url).json()

#     self.invitation.invite_or_request = "INVITE"
#     self.invitation.save()
#     invitation_json["status"] = "REJECTED"

#     invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

#     response = self.client.put(self.url, invitation_json)

#     self.assertEqual(response.status_code, status.HTTP_200_OK)
#     self.assertFalse(invitation.requester in invitation.organization.members.all())
#     self.assertEqual(
#         len(
#             Notification.objects.filter(
#                 notification_type="ORG_INVITE_REJECTED",
#                 email=self.invitation.request_receiver.email,
#             )
#         ),
#         1,
#     )

# def test_request_invalid_suceeds(self):
#     self.client.force_authenticate(user=self.invitation.request_receiver)

#     invitation_json = self.client.get(self.url).json()

#     self.invitation.invite_or_request = "REQUEST"
#     self.invitation.save()
#     invitation_json["status"] = "INVALID"

#     invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

#     response = self.client.put(self.url, invitation_json)

#     self.assertEqual(response.status_code, status.HTTP_200_OK)
#     self.assertFalse(invitation.requester in invitation.organization.members.all())
#     self.assertEqual(
#         len(
#             Notification.objects.filter(
#                 notification_type="ORG_REQUEST_INVALID", email=self.invitation.requester.email
#             )
#         ),
#         1,
#     )

# def test_invite_invalid_suceeds(self):
#     self.client.force_authenticate(user=self.invitation.requester)

#     invitation_json = self.client.get(self.url).json()

#     self.invitation.invite_or_request = "INVITE"
#     self.invitation.save()
#     invitation_json["status"] = "INVALID"

#     invitation = OrganizationInvitation.objects.get(pk=self.invitation.id)

#     response = self.client.put(self.url, invitation_json)

#     self.assertEqual(response.status_code, status.HTTP_200_OK)
#     self.assertFalse(invitation.requester in invitation.organization.members.all())
#     self.assertEqual(
#         len(
#             Notification.objects.filter(
#                 notification_type="ORG_INVITE_INVALID",
#                 email=self.invitation.request_receiver.email,
#             )
#         ),
#         1,
#     )

# def test_put_request_from_wrong_user_fails(self):
#     self.client.force_authenticate(user=self.invitation.requester)
#     invitation_json = self.client.get(self.url).json()

#     invitation_json["status"] = "ACCEPTED"
#     self.invitation.invite_or_request = "REQUEST"
#     self.invitation.save()

#     response = self.client.put(self.url, invitation_json)
#     self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

# def test_put_request_without_authentication_fails(self):
#     self.client.force_authenticate(user=None)
#     invitation_json = self.client.get(self.url).json()

#     invitation_json["status"] = "ACCEPTED"

#     response = self.client.put(self.url, invitation_json)
#     self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

# def test_delete_request_deletes_invitation(self):
#     self.client.force_authenticate(user=self.invitation.requester)
#     invitation_id = self.invitation.id
#     response = self.client.delete(self.url)
#     self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#     self.assertEqual(OrganizationInvitation.objects.filter(id=invitation_id).count(), 0)

# def test_delete_request_from_non_requester_fails(self):
#     self.client.force_authenticate(user=self.invitation.request_receiver)
#     response = self.client.delete(self.url)
#     self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

# def test_delete_request_from_unauthenticated_fails(self):
#     self.client.force_authenticate(user=None)
#     response = self.client.delete(self.url)
#     self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

# def test_delete_request_only_soft_deletes_objects(self):
#     self.client.force_authenticate(user=self.invitation.requester)
#     invitation_id = self.invitation.id
#     response = self.client.delete(self.url)
#     self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#     self.assertEqual(OrganizationInvitation.deleted_objects.filter(id=invitation_id).count(), 1)
