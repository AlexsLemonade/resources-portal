from unittest.mock import patch

from django.core.management import call_command
from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.management.commands.populate_dev_database import populate_dev_database
from resources_portal.models import (
    Attachment,
    Material,
    MaterialRequest,
    Notification,
    Organization,
    OrganizationUserSetting,
    User,
)
from resources_portal.test.utils import (
    MOCK_EMAIL,
    MOCK_GRANTS,
    clean_test_file_uploads,
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
)


class TestMultipleResourcesRequestedAndFulfilled(APITestCase):
    """
    Tests search functionality, multiple resources being requested, and multiple resources being fulfilled.
    The flow of the test is as follows:
    1. Create account (Requester)
    2. Search resources
    3. Select two resources from PrimaryLab and requests them, uploading two signed IRBs
    4. Postdoc approves the requests
    5. The Requester uploads two signed MTAs
    6. Postdoc uploads executed MTA/IRBs
    7. Postdoc marks the request fulfilled. (Separate from uploading MTA because it might take a while to ship out the resource.)

    During the test, the following notifications (and no more) will be sent:

    1. The Postdoc receives two notifications that resources were requested.
    2. The Requester receives two notifications that her requests were approved.
    3. The Postdoc is notified that the MTAs were uploaded.
    4. The Requester is notified that the executed MTA/IRBs were uploaded.
    5. The Requester receives two notifications that her requests were fulfilled.
    """

    def setUp(self):
        populate_dev_database()
        clean_test_file_uploads()

        # Put newly created materials in the search index
        call_command("search_index", "-f", "--rebuild")

        self.primary_prof = User.objects.get(username="PrimaryProf")
        self.secondary_prof = User.objects.get(username="SecondaryProf")
        self.post_doc = User.objects.get(username="PostDoc")

        self.primary_lab = Organization.objects.get(name="PrimaryLab")

        self.primary_lab.assign_member_perms(self.post_doc)
        OrganizationUserSetting.objects.create(user=self.post_doc, organization=self.primary_lab)

        self.user_data = {
            "email": MOCK_EMAIL,
            "grant_info": MOCK_GRANTS,
        }

        Notification.objects.all().delete()

    def tearDown(self):
        # Rebuild search index with what's actaully in the django database
        call_command("search_index", "-f", "--rebuild")

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_multiple_resources_requested_and_fulfilled(
        self, mock_auth_request, mock_record_request
    ):
        # Create account (Requester)
        response = self.client.post(
            reverse("orcid-credentials"), {"code": "MOCKCODE", "origin_url": "mock.origin.com"}
        )

        self.user_data["orcid"] = response.json()["orcid"]
        self.user_data["access_token"] = response.json()["access_token"]
        self.user_data["refresh_token"] = response.json()["refresh_token"]

        response = self.client.post(reverse("user-list"), self.user_data)
        requester = User.objects.get(pk=response.json()["user_id"])

        # Search resources
        response = self.client.get(reverse("search-materials-list"), {"organization": "PrimaryLab"})

        search_json = response.json()["results"]
        # Choose the second and third materials becuase both of them are assigned to PostDoc.

        chosen_materials_json = search_json[1:3]

        # Select two resources from PrimaryLab and request them, uploading two signed IRBs
        self.client.force_authenticate(user=requester)

        # Upload IRBs
        irb_json = {
            "filename": "irb_attachment",
            "description": "Institutional Board Review for the research in question.",
        }

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            data = {**irb_json, "file": fp}
            response = self.client.post(reverse("attachment-list"), data, format="multipart")

        irb_1_id = response.data["id"]

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            data = {**irb_json, "file": fp}
            response = self.client.post(reverse("attachment-list"), data, format="multipart")

        irb_2_id = response.data["id"]

        # POST requests
        material1 = Material.objects.get(pk=chosen_materials_json[0]["id"])
        material2 = Material.objects.get(pk=chosen_materials_json[1]["id"])

        request1 = MaterialRequest(material=material1, requester=requester)
        request2 = MaterialRequest(material=material2, requester=requester)

        response = self.client.post(
            reverse("material-request-list"), model_to_dict(request1), format="json"
        )
        request_1_id = response.data["id"]
        response = self.client.post(
            reverse("material-request-list"), model_to_dict(request2), format="json"
        )
        request_2_id = response.data["id"]

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="TRANSFER_REQUESTED", email=self.post_doc.email
                )
            ),
            2,
        )

        self.client.put(
            reverse("material-request-detail", args=[request_1_id]), {"irb_attachment": irb_1_id}
        )
        self.client.put(
            reverse("material-request-detail", args=[request_2_id]), {"irb_attachment": irb_2_id}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Assert that ownership of attachments to the material-requests is shared by the requester and the requested org
        self.assertEqual(Attachment.objects.get(pk=irb_1_id).owned_by_org, self.primary_lab)
        self.assertEqual(Attachment.objects.get(pk=irb_2_id).owned_by_org, self.primary_lab)

        # Postdoc approves the requests
        self.client.force_authenticate(user=self.post_doc)

        response = self.client.put(
            reverse("material-request-detail", args=[request_1_id]), {"status": "APPROVED"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            reverse("material-request-detail", args=[request_2_id]), {"status": "APPROVED"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(notification_type="MATERIAL_REQUEST_REQUESTER_ACCEPTED")
            ),
            2,
        )
        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_APPROVED")),
            4,
        )

        # The Requester uploads two signed MTAs
        self.client.force_authenticate(user=requester)

        signed_mta_json = {
            "filename": "signed_mta",
            "description": "Signed transfer agreement for the material.",
        }

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            data = {**signed_mta_json, "file": fp}
            response = self.client.post(reverse("attachment-list"), data, format="multipart")

        mta_1_id = response.data["id"]

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            data = {**signed_mta_json, "file": fp}
            response = self.client.post(reverse("attachment-list"), data, format="multipart")

        mta_2_id = response.data["id"]

        response = self.client.put(
            reverse("material-request-detail", args=[request_1_id]),
            {"requester_signed_mta_attachment": mta_1_id},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            reverse("material-request-detail", args=[request_2_id]),
            {"requester_signed_mta_attachment": mta_2_id},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="SIGNED_MTA_UPLOADED", email=self.post_doc.email
                )
            ),
            2,
        )

        self.assertEqual(Attachment.objects.get(pk=mta_1_id).owned_by_org, self.primary_lab)
        self.assertEqual(Attachment.objects.get(pk=mta_2_id).owned_by_org, self.primary_lab)

        # Postdoc uploads executed MTA/IRBs
        self.client.force_authenticate(user=self.post_doc)

        executed_mta_json = {
            "filename": "exectuted_mta",
            "description": "Executed transfer agreement for the material.",
        }

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            data = {**executed_mta_json, "file": fp}
            response = self.client.post(reverse("attachment-list"), data, format="multipart")

        mta_1_id = response.data["id"]

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            data = {**executed_mta_json, "file": fp}
            response = self.client.post(reverse("attachment-list"), data, format="multipart")

        mta_2_id = response.data["id"]

        response = self.client.put(
            reverse("material-request-detail", args=[request_1_id]),
            {"executed_mta_attachment": mta_1_id},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            reverse("material-request-detail", args=[request_2_id]),
            {"executed_mta_attachment": mta_2_id},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="EXECUTED_MTA_UPLOADED", email=requester.email
                )
            ),
            2,
        )

        self.assertEqual(Attachment.objects.get(pk=mta_1_id).owned_by_user, requester)
        self.assertEqual(Attachment.objects.get(pk=mta_2_id).owned_by_user, requester)

        # Postdoc marks the requests fulfilled
        self.client.force_authenticate(user=self.post_doc)

        response = self.client.put(
            reverse("material-request-detail", args=[request_1_id]), {"status": "FULFILLED"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            reverse("material-request-detail", args=[request_2_id]), {"status": "FULFILLED"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="TRANSFER_FULFILLED", email=requester.email
                )
            ),
            2,
        )

        # Final checks
        self.assertEqual(len(Notification.objects.all()), 14)
