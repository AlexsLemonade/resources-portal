from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.management.commands.populate_dev_database import populate_dev_database
from resources_portal.models import (
    MaterialRequest,
    Notification,
    Organization,
    OrganizationUserSetting,
    User,
)
from resources_portal.test.factories import MaterialFactory
from resources_portal.test.utils import clean_test_file_uploads


class TestResourceListedAndRequested(APITestCase):
    """
    Tests the flow of listing a resource, requesting it, and creating/resolving an issue..

    The flow of the test is as follows:
    1. The PrimaryProf lists a new resource with PrimaryLab.
    2. SecondaryProf requests the resource.
    3. Postdoc approves the request.
    4. SecondaryProf upload the signed MTA.
    5. Postdoc uploads the executed MTA and marks the request fulfilled.
    6. SecondaryProf creates an issue for the request.
    7. Postdoc resolves the issue.
    8. SecondaryProf verifies the request as fulfilled.

    During the test, the following notifications (and no more) will be sent:

    1. The Postdoc receives a notification that a resource was requested
    2. SecondaryProf is notified that her request was approved.
    3. Postdoc receives notification that SecondaryProf has signed MTA.
    4. SecondaryProf receives notification that Postdoc has uploaded executed MTA.
    5. SecondaryProf receives notification that Postdoc has fulfilled his request.
    6. Postdoc receives a notification that SecondaryProf has created an issue.
    7. SecondaryProf receives a notification that Postdoc closed his issue.
    8. SecondaryProf receives a notification that Postdoc fulfilled his request.
    9. Postdoc receives a notification that SecondaryProf verified the request was fulfilled.
    """

    def setUp(self):
        clean_test_file_uploads()
        populate_dev_database()

        self.primary_prof = User.objects.get(username="PrimaryProf")
        self.secondary_prof = User.objects.get(username="SecondaryProf")
        self.post_doc = User.objects.get(username="PostDoc")

        self.primary_lab = Organization.objects.get(name="PrimaryLab")

        self.primary_lab.assign_member_perms(self.post_doc)
        OrganizationUserSetting.objects.create(user=self.post_doc, organization=self.primary_lab)

        Notification.objects.all().delete()

    def test_resource_listed_and_requested(self):
        # PrimaryProf lists new resource on PrimaryLab
        self.client.force_authenticate(user=self.primary_prof)

        material = MaterialFactory(contact_user=self.post_doc, organization=self.primary_lab)
        material_data = model_to_dict(material)

        grant_list = []
        for grant in material_data["grants"]:
            grant_list.append(grant.id)

        material_data["grants"] = grant_list

        response = self.client.post(reverse("material-list"), material_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(len(Notification.objects.filter(notification_type="MATERIAL_ADDED")), 2)

        # SecondaryProf requests that resource
        self.client.force_authenticate(user=self.secondary_prof)

        request = MaterialRequest(material=material, requester=self.secondary_prof)

        response = self.client.post(
            reverse("material-request-list"), model_to_dict(request), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        request_id = response.data["id"]

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_SHARER_ASSIGNED_NEW"
                )
            ),
            1,
        )
        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_RECEIVED")),
            1,
        )

        # Postdoc approves the request
        request_url = reverse("material-request-detail", args=[request_id])

        self.client.force_authenticate(user=self.post_doc)

        response = self.client.put(request_url, {"status": "APPROVED"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(notification_type="MATERIAL_REQUEST_REQUESTER_ACCEPTED")
            ),
            1,
        )
        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_APPROVED")),
            2,
        )

        # SecondaryProf uploads the signed MTA
        self.client.force_authenticate(user=self.secondary_prof)

        signed_mta_data = {
            "filename": "signed_mta",
            "description": "Signed transfer agreement for the material.",
            "attachment_type": "SIGNED_MTA",
        }

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            signed_mta_data["file"] = fp
            response = self.client.post(
                reverse("attachment-list"), signed_mta_data, format="multipart"
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        signed_mta_id = response.data["id"]

        response = self.client.put(request_url, {"requester_signed_mta_attachment": signed_mta_id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_SHARER_RECEIVED_MTA"
                )
            ),
            2,
        )

        # Postdoc uploads the executed MTA and marks the request fulfilled.
        self.client.force_authenticate(user=self.post_doc)
        executed_mta_data = {
            "filename": "executed_mta",
            "description": "Executed transfer agreement for the material.",
            "attachment_type": "EXECUTED_MTA",
        }

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            executed_mta_data["file"] = fp
            response = self.client.post(
                reverse("attachment-list"), executed_mta_data, format="multipart"
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        executed_mta_id = response.data["id"]

        response = self.client.put(
            request_url, {"executed_mta_attachment": executed_mta_id, "status": "FULFILLED"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA",
                )
            ),
            1,
        )
        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_SHARER_EXECUTED_MTA",
                )
            ),
            2,
        )
        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_FULFILLED")),
            2,
        )
        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_REQUESTER_FULFILLED",
                )
            ),
            1,
        )

        # SecondaryProf creates an issue for the request.
        self.client.force_authenticate(user=self.secondary_prof)

        request_issue_json = {"status": "OPEN", "description": "I never got the package!"}
        issue_response = self.client.post(
            reverse("material-requests-issues-list", args=[request_id]), request_issue_json
        )
        self.assertEqual(issue_response.status_code, status.HTTP_201_CREATED)

        # Both the PrimaryProf and the Postdoc are notified.
        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_ISSUE_SHARER_REPORTED"
                )
            ),
            2,
        )

        # Postdoc creates a fulfillment note and resolves the issue.
        self.client.force_authenticate(user=self.post_doc)

        fulfillment_note_json = {
            "text": "Whoops, forgot to actually ship the package.",
            "material_request": request_id,
        }
        fulfillment_note_response = self.client.post(
            reverse("material-requests-notes-list", args=[request_id]), fulfillment_note_json,
        )
        self.assertEqual(fulfillment_note_response.status_code, status.HTTP_201_CREATED)

        request_issue_json = {"status": "CLOSED"}
        issue_response = self.client.put(
            reverse(
                "material-requests-issues-detail", args=[request_id, issue_response.json()["id"]]
            ),
            request_issue_json,
        )
        self.assertEqual(issue_response.status_code, status.HTTP_200_OK)

        # This is the second time the request was marked as fulfilled,
        # so now there should be 2x!
        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_FULFILLED")),
            4,
        )
        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_REQUESTER_FULFILLED",
                )
            ),
            2,
        )

        # SecondaryProf verifies the request as fulfilled.
        self.client.force_authenticate(user=self.secondary_prof)
        response = self.client.put(
            request_url,
            {"executed_mta_attachment": executed_mta_id, "status": "VERIFIED_FULFILLED"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_VERIFIED")),
            2,
        )

        # SecondaryProf can view the fulfillment note
        self.assertTrue("text" in response.json()["fulfillment_notes"][0])

        # Final checks
        self.assertEqual(len(Notification.objects.all()), 22)
