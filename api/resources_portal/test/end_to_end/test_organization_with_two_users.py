from json import loads
from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import Notification, Organization, OrganizationUserSetting, User
from resources_portal.test.utils import (
    MOCK_EMAIL,
    MOCK_GRANTS,
    generate_mock_orcid_authorization_response,
    generate_random_mock_orcid_record_response,
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
        material_data = loads(open("./dev_data/materials.json").read())
        self.material_json = material_data["materials"][0]

        self.user_data = {
            "email": MOCK_EMAIL,
            "grant_info": MOCK_GRANTS,
        }

    @patch("orcid.PublicAPI", side_effect=generate_random_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_organization_with_two_users(self, mock_auth_request, mock_record_request):
        # Create account Prof
        response = self.client.post(
            reverse("orcid-credentials"), {"code": "MOCKCODE", "origin_url": "mock.origin.com"}
        )

        self.user_data["orcid"] = response.json()["orcid"]
        self.user_data["access_token"] = response.json()["access_token"]
        self.user_data["refresh_token"] = response.json()["refresh_token"]

        response = self.client.post(reverse("user-list"), self.user_data)
        prof = User.objects.get(pk=response.json()["user_id"])

        # Create account Postdoc
        response = self.client.post(
            reverse("orcid-credentials"), {"code": "MOCKCODE", "origin_url": "mock.origin.com"}
        )

        self.user_data["orcid"] = response.json()["orcid"]
        self.user_data["access_token"] = response.json()["access_token"]
        self.user_data["refresh_token"] = response.json()["refresh_token"]

        response = self.client.post(reverse("user-list"), self.user_data)
        post_doc = User.objects.get(pk=response.json()["user_id"])

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

        invitation_json = {
            "organization": lab.id,
            "request_receiver": post_doc.id,
            "requester": prof.id,
            "invite_or_request": "INVITE",
        }

        response = self.client.post(reverse("invitation-list"), invitation_json, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Both are notified.
        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="ORGANIZATION_NEW_MEMBER"
                    # Once we re-enable invitation acceptances this
                    # will need to change back.
                    # notification_type="ORG_INVITE_CREATED",
                )
            ),
            1,
        )
        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORGANIZATION_INVITE")), 1
        )

        # We currently allow adding to orgs without acceptance.
        # # Postdoc accepts invitation to join Lab
        # self.client.force_authenticate(user=post_doc)

        # invitation_id = response.data["id"]
        # response = self.client.patch(
        #     reverse("invitation-detail", args=[invitation_id]), {"status": "ACCEPTED"}
        # )

        # self.assertEqual(response.status_code, status.HTTP_200_OK)

        # self.assertEqual(
        #     len(
        #         Notification.objects.filter(
        #             notification_type="ORG_INVITE_ACCEPTED", email=prof.email
        #         )
        #     ),
        #     1,
        # )

        # Prof lists resource under Lab
        self.client.force_authenticate(user=prof)

        self.material_json["contact_user"] = prof.id
        self.material_json["organization"] = lab.id

        response = self.client.post(reverse("material-list"), self.material_json, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Prof removes all notification settings
        self.client.force_authenticate(user=prof)

        prof_changes = {"non_assigned_notifications": False, "weekly_digest": False}
        prof_url = reverse("user-detail", args=[prof.id])
        response = self.client.patch(prof_url, prof_changes)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Final checks
        self.assertEqual(len(Notification.objects.all()), 2)
