from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.management.commands.populate_test_database import populate_test_database
from resources_portal.models import (
    Attachment,
    Material,
    MaterialRequest,
    Notification,
    Organization,
    OrganizationInvitation,
    User,
)
from resources_portal.test.mocks import (
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
    get_mock_oauth_url,
)


class TestNewMemberJoinsALab(APITestCase):
    """
    Tests the flow of a new member joining the organization and being assigned materials.
    The flow of the test is as follows:
    1. Create account (NewMember)
    2. PrimaryProf invites NewMember to join PrimaryLab.
    3. NewMember accepts the invitation to join PrimaryLab.
    4. PostDoc is removed from PrimaryLab. All materials assigned to him become assigned to PrimaryProf.
    5. PrimaryProf assigns half of the materials to NewMember.
    6. SecondaryProf requests a resource assigned to NewMember.
    7. NewMember is notified that the material has been requested.
    8. NewMember approves the request and uploads executed MTA/IRB.

    During the test, the following notifications (and no more) will be sent:

    1. NewMember is notified that she has been invited to join PrimaryLab.
    2. The PrimaryProf receives a notification that NewMember accepted her invitation.
    3. The Postdoc receives a notification that they have been removed from the organization.
    4. NewMember receives a notification that a resource was requested.
    5. SecondaryProf is notified that her request was approved.
    """

    def setUp(self):
        populate_test_database()

        self.primary_prof = User.objects.get(username="PrimaryProf")
        self.secondary_prof = User.objects.get(username="SecondaryProf")
        self.post_doc = User.objects.get(username="PostDoc")

        self.primary_lab = Organization.objects.get(name="PrimaryLab")

        self.primary_lab.assign_member_perms(self.post_doc)

        Notification.objects.all().delete()

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_new_member_joins_a_lab(self, mock_auth_request, mock_record_request):
        # Create account (NewMember)
        self.client.get(get_mock_oauth_url([]))

        # Client is now logged in as user, get user ID from session data
        new_member = User.objects.get(pk=self.client.session["_auth_user_id"])

        # PrimaryProf invites NewMember to join PrimaryLab
        self.client.force_authenticate(user=self.primary_prof)

        invitation_json = {
            "organization": self.primary_lab.id,
            "request_reciever": self.primary_prof.id,
            "requester": new_member.id,
            "invite_or_request": "INVITE",
        }

        response = self.client.post(reverse("invitation-list"), invitation_json, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        invitation_id = response.data["id"]

        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_INVITE_CREATED")), 1
        )

        # NewMember accepts the invitation to join PrimaryLab
        self.client.force_authenticate(user=new_member)

        response = self.client.patch(
            reverse("invitation-detail", args=[invitation_id]), {"status": "ACCEPTED"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_INVITE_ACCEPTED")), 1
        )

        # PostDoc is removed from PrimaryLab
        self.client.force_authenticate(user=self.primary_prof)

        url = reverse("organizations-members-detail", args=[self.primary_lab.id, self.post_doc.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, 204)

        self.assertEqual(len(Notification.objects.filter(notification_type="REMOVED_FROM_ORG")), 1)

        # All materials assigned to PostDoc will be reassigned to the owner when PostDoc leaves the organization.
        for material in self.primary_lab.materials.all():
            self.assertTrue(material.contact_user == self.primary_prof)

        # PrimaryProf assigns half of the materials to NewMember.
        material_url = reverse("organizations-materials-list", args=[self.primary_lab.id])
        response = self.client.get(material_url)

        materials_json = response.json()["results"]

        # Rounds down number of materials assigned to new_member
        for i in range(int(len(materials_json) / 2)):
            material_json = materials_json[i]
            material_json["contact_user"] = new_member.id

            response = self.client.put(
                reverse("material-detail", args=[material_json["id"]]), material_json
            )

            material = Material.objects.get(pk=material_json["id"])

            self.assertEqual(material.contact_user, new_member)

        # SecondaryProf requests a resource assigned to NewMember
        self.client.force_authenticate(user=self.secondary_prof)

        request_json = {"material": material.id, "requester": self.secondary_prof.id}

        response = self.client.post(reverse("material-request-list"), request_json, format="json")

        request_id = response.data["id"]

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # NewMember has been notified that the material has been requested
        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="TRANSFER_REQUESTED", notified_user=new_member
                )
            ),
            1,
        )

        # NewMember approves the request and uploads executed MTA/IRB
        self.client.force_authenticate(user=new_member)

        # Post mta attachment
        executed_mta_json = {
            "filename": "executed_mta",
            "description": "Executed transfer agreement for the material.",
            "s3_bucket": "a bucket",
            "s3_key": "a key",
        }

        response = self.client.post(reverse("attachment-list"), executed_mta_json, format="json")
        executed_mta_id = response.data["id"]
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Post irb attachment
        executed_irb_json = {
            "filename": "executed_irb",
            "description": "Executed irb for the material.",
            "s3_bucket": "a bucket",
            "s3_key": "a key",
        }

        response = self.client.post(reverse("attachment-list"), executed_irb_json, format="json")
        executed_irb_id = response.data["id"]
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # PUT updates to request
        request_update_data = {
            "status": "APPROVED",
            "executed_mta_attachment": executed_mta_id,
            "irb_attachment": executed_irb_id,
        }

        response = self.client.put(
            reverse("material-request-detail", args=[request_id]), request_update_data
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(Notification.objects.filter(notification_type="TRANSFER_APPROVED")), 1)

        # Final checks
        self.assertEqual(len(Notification.objects.all()), 5)
