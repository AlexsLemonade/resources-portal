from unittest.mock import patch

from django.forms.models import model_to_dict
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
    OrganizationUserSetting,
    User,
)
from resources_portal.test.mocks import (
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
    get_mock_oauth_url,
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
        populate_test_database()

        self.primary_prof = User.objects.get(username="PrimaryProf")
        self.secondary_prof = User.objects.get(username="SecondaryProf")
        self.post_doc = User.objects.get(username="PostDoc")

        self.primary_lab = Organization.objects.get(name="PrimaryLab")

        self.primary_lab.assign_member_perms(self.post_doc)
        OrganizationUserSetting.objects.create(user=self.post_doc, organization=self.primary_lab)

        Notification.objects.all().delete()

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_create_account_and_list_resource(self, mock_auth_request, mock_record_request):
        # Create account (Requester)
        self.client.get(get_mock_oauth_url([]))
        requester = User.objects.get(pk=self.client.session["_auth_user_id"])

        # Search resources
        response = self.client.get(reverse("search-materials-list"), {"organization": "PrimaryLab"})

        search_json = response.json()["results"]
        chosen_materials_json = search_json[0:2]

        # Select two resources from PrimaryLab and request them, uploading two signed IRBs
        self.client.force_authenticate(user=requester)

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
            len(Notification.objects.filter(notification_type="TRANSFER_REQUESTED")), 2
        )

        # Upload IRBs
        irb1 = Attachment(
            filename="executed_mta",
            description="Executed transfer agreement for the material.",
            s3_bucket="a bucket",
            s3_key="a key",
        )

        irb2 = Attachment(
            filename="executed_mta",
            description="Executed transfer agreement for the material.",
            s3_bucket="a bucket",
            s3_key="a key",
        )

        response = self.client.post(reverse("attachment-list"), model_to_dict(irb1), format="json")
        irb_1_id = response.data["id"]
        response = self.client.post(reverse("attachment-list"), model_to_dict(irb2), format="json")
        irb_2_id = response.data["id"]

        self.client.put(
            reverse("material-request-detail", args=[request_1_id]), {"irb_attachment": irb_1_id}
        )
        self.client.put(
            reverse("material-request-detail", args=[request_2_id]), {"irb_attachment": irb_2_id}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

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

        self.assertEqual(len(Notification.objects.filter(notification_type="TRANSFER_APPROVED")), 2)

        # The Requester uploads two signed MTAs
        self.client.force_authenticate(user=requester)

        signed_mta_1 = Attachment(
            filename="signed_mta",
            description="Signed transfer agreement for the material.",
            s3_bucket="a bucket",
            s3_key="a key",
        )
        signed_mta_2 = Attachment(
            filename="signed_mta",
            description="Signed transfer agreement for the material.",
            s3_bucket="a bucket",
            s3_key="a key",
        )

        response = self.client.post(
            reverse("attachment-list"), model_to_dict(signed_mta_1), format="json"
        )
        mta_1_id = response.data["id"]
        response = self.client.post(
            reverse("attachment-list"), model_to_dict(signed_mta_2), format="json"
        )
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
            len(Notification.objects.filter(notification_type="SIGNED_MTA_UPLOADED")), 2
        )

        # Postdoc uploads executed MTA/IRBs
        self.client.force_authenticate(user=self.post_doc)

        executed_mta_1 = Attachment(
            filename="exectuted_mta",
            description="Executed transfer agreement for the material.",
            s3_bucket="a bucket",
            s3_key="a key",
        )
        executed_mta_2 = Attachment(
            filename="exectuted_mta",
            description="Executed transfer agreement for the material.",
            s3_bucket="a bucket",
            s3_key="a key",
        )

        response = self.client.post(
            reverse("attachment-list"), model_to_dict(executed_mta_1), format="json"
        )
        mta_1_id = response.data["id"]
        response = self.client.post(
            reverse("attachment-list"), model_to_dict(executed_mta_2), format="json"
        )
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
            len(Notification.objects.filter(notification_type="EXECUTED_MTA_UPLOADED")), 2
        )

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
            len(Notification.objects.filter(notification_type="TRANSFER_FULFILLED")), 2
        )

        # Final checks
        self.assertEqual(len(Notification.objects.all()), 10)
