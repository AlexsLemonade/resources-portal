from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.management.commands.populate_test_database import populate_test_database
from resources_portal.models import Attachment, MaterialRequest, Notification, Organization, User
from resources_portal.test.factories import MaterialFactory


class TestResourceListedAndRequested(APITestCase):
    """
    Tests the flow of listing a resource and requesting it.
    The flow of the test is as follows:
    1. The PrimaryProf lists a new resource with PrimaryLab.
    2. SecondaryProf requests the resource.
    3. Postdoc approves the request.
    4. SecondaryProf upload the signed MTA.
    5. Postdoc uploads the executed MTA.

    During the test, the following notifications (and no more) will be sent:

    1. The Postdoc receives a notification that a resource was requested
    2. SecondaryProf is notified that her request was approved.
    3. Postdoc receives notification that SecondaryProf has signed MTA.
    """

    def setUp(self):
        populate_test_database()

        self.primary_prof = User.objects.get(username="PrimaryProf")
        self.secondary_prof = User.objects.get(username="SecondaryProf")
        self.post_doc = User.objects.get(username="PostDoc")

        self.primary_lab = Organization.objects.get(name="PrimaryLab")

        self.primary_lab.assign_member_perms(self.post_doc)

        Notification.objects.all().delete()

    def test_resource_listed_and_requested(self):
        # PrimaryProf lists new resource on PrimaryLab
        self.client.force_authenticate(user=self.primary_prof)

        material = MaterialFactory(contact_user=self.primary_prof, organization=self.primary_lab)
        material_data = model_to_dict(material)

        grant_list = []
        for grant in material_data["grants"]:
            grant_list.append(grant.id)

        material_data["grants"] = grant_list

        response = self.client.post(reverse("material-list"), material_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # SecondaryProf requests that resource
        self.client.force_authenticate(user=self.secondary_prof)

        request = MaterialRequest(material=material, requester=self.secondary_prof)

        response = self.client.post(
            reverse("material-request-list"), model_to_dict(request), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        request_id = response.data["id"]

        self.assertEqual(
            len(Notification.objects.filter(notification_type="TRANSFER_REQUESTED")), 1
        )

        # Postdoc approves the request
        request_url = reverse("material-request-detail", args=[request_id])

        self.client.force_authenticate(user=self.post_doc)

        response = self.client.put(request_url, {"status": "APPROVED"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(Notification.objects.filter(notification_type="TRANSFER_APPROVED")), 1)

        # SecondaryProf uploads the signed MTA
        self.client.force_authenticate(user=self.secondary_prof)

        signed_mta = Attachment(
            filename="signed_mta",
            description="Transfer agreement for the material.",
            s3_bucket="a bucket",
            s3_key="a key",
        )

        signed_mta_data = model_to_dict(signed_mta)

        response = self.client.post(reverse("attachment-list"), signed_mta_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        signed_mta_id = response.data["id"]

        response = self.client.put(request_url, {"requester_signed_mta_attachment": signed_mta_id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(Notification.objects.filter(notification_type="MTA_UPLOADED")), 1)

        # Postdoc uploads the executed MTA
        self.client.force_authenticate(user=self.post_doc)

        executed_mta = Attachment(
            filename="executed_mta",
            description="Executed transfer agreement for the material.",
            s3_bucket="a bucket",
            s3_key="a key",
        )

        executed_mta_data = model_to_dict(executed_mta)

        response = self.client.post(reverse("attachment-list"), executed_mta_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        executed_mta_id = response.data["id"]

        response = self.client.put(request_url, {"executed_mta_attachment": executed_mta_id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Final checks
        self.assertEqual(len(Notification.objects.all()), 3)
