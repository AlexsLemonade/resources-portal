from json import loads
from unittest.mock import patch

from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import Notification, Organization, OrganizationInvitation, User
from resources_portal.test.factories import GrantFactory
from resources_portal.test.mocks import (
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
    get_mock_oauth_url,
)


class TestOrganizationWithTwoUsers(APITestCase):
    """
    Tests the flow of two users joining an organization and modifying some settings.
    The flow of the test is as follows:
    1. Create account Prof
    2. Create account Postdoc
    3. Prof creates organization Lab with grant id.
    4. Prof invites Postdoc to join Lab.
    5. Postdoc accepts invitation to join Lab.
    6. Prof lists resource under Lab.
    7. Prof removes all notification settings.

    During the test, the following notifications (and no more) will be sent:

    1. The Postdoc receives a notification that the Prof invited her to join her lab.
    2. The Prof is notified that Postdoc accepted her invitation.
    """

    def setUp(self):
        self.grant = GrantFactory()

        material_data = loads(open("./dev_data/materials.json").read())
        self.material_json = material_data["materials"][0]

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_new_member_joins_a_lab(self, mock_auth_request, mock_record_request):
        # Create account Prof
        self.client.get(get_mock_oauth_url([self.grant]))
        prof = User.objects.get(pk=self.client.session["_auth_user_id"])

        # Create account Postdoc
        self.client.get(get_mock_oauth_url([]))
        post_doc = User.objects.get(pk=self.client.session["_auth_user_id"])

        # Prof creates organization Lab with grant id
        # null members might be an issue?
        self.client.force_authenticate(user=prof)

        organization_data = {
            "name": "Lab",
            "owner": {"id": prof.id},
            "grants": [prof.grants.first().id],
        }

        response = self.client.post(reverse("organization-list"), organization_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        lab = Organization.objects.get(pk=response.data["id"])

        # Prof invites Postdoc to join Lab
        self.client.force_authenticate(user=prof)

        invitation = OrganizationInvitation(
            organization=lab, request_reciever=prof, requester=post_doc, invite_or_request="INVITE",
        )

        response = self.client.post(
            reverse("invitation-list"), model_to_dict(invitation), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        invitation_id = response.data["id"]

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="ORG_INVITE_CREATED", email=post_doc.email
                )
            ),
            1,
        )

        # Postdoc accepts invitation to join Lab
        self.client.force_authenticate(user=post_doc)

        response = self.client.patch(
            reverse("invitation-detail", args=[invitation_id]), {"status": "ACCEPTED"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="ORG_INVITE_ACCEPTED", email=prof.email
                )
            ),
            1,
        )

        # Prof lists resource under Lab
        self.client.force_authenticate(user=prof)

        self.material_json["contact_user"] = prof.id
        self.material_json["organization"] = lab.id

        response = self.client.post(reverse("material-list"), self.material_json, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Prof removes all notification settings
        self.client.force_authenticate(user=prof)

        settings_url = reverse(
            "organization-user-setting-detail", args=[prof.organization_settings.first().id]
        )

        settings_json = self.client.get(settings_url).json()

        settings_json["new_request_notif"] = False
        settings_json["change_in_request_status_notif"] = False
        settings_json["request_approval_determined_notif"] = False
        settings_json["request_assigned_notif"] = False
        settings_json["reminder_notif"] = False
        settings_json["transfer_requested_notif"] = False
        settings_json["transfer_updated_notif"] = False
        settings_json["perms_granted_notif"] = False
        settings_json["misc_notif"] = False

        response = self.client.put(settings_url, settings_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Final checks
        self.assertEqual(len(Notification.objects.all()), 2)
