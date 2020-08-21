from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.management.commands.populate_dev_database import populate_dev_database
from resources_portal.models import Notification, Organization, User
from resources_portal.test.factories import MaterialFactory


class TransferOfResource(APITestCase):
    """
    Tests the flow of the PrimaryProf inviting PostDoc to the PrimaryLab, then PostDoc transferring materials to PrimaryLab.
    The flow of the test is as follows:
    1. The Postdoc lists a resource with his personal organization.
    2. The Postdoc is invited to PrimaryLab.
    3. The Postdoc accepts the invitation.
    4. The PostDoc transfers the resource to PrimaryLab.

    During the test, the following notifications (and no more) will be sent:

    1. The PostDoc receives a notification that they were invited to PrimaryLab.
    2. The PrimaryProf receives a notification that the invite was accepted.
    """

    def setUp(self):
        populate_dev_database()

        self.primary_prof = User.objects.get(username="PrimaryProf")
        self.post_doc = User.objects.get(username="PostDoc")

        self.primary_lab = Organization.objects.get(name="PrimaryLab")
        self.post_doc_personal_org = Organization.objects.get(name="PostDocOrg")

        self.primary_lab.members.remove(self.post_doc)

        Notification.objects.all().delete()

    def test_transfer_of_resource(self):
        # The Postdoc lists a resource with his personal organization
        self.client.force_authenticate(user=self.post_doc)

        material = MaterialFactory(
            contact_user=self.post_doc, organization=self.post_doc_personal_org
        )
        material_data = model_to_dict(material)

        grant_list = []
        for grant in material_data["grants"]:
            grant_list.append(grant.id)

        material_data["grants"] = grant_list

        response = self.client.post(reverse("material-list"), material_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # The Postdoc is invited to PrimaryLab
        self.client.force_authenticate(user=self.primary_prof)

        invitation_json = {
            "organization": self.primary_lab.id,
            "request_receiver": self.primary_prof.id,
            "requester": self.post_doc.id,
            "invite_or_request": "INVITE",
        }

        response = self.client.post(reverse("invitation-list"), invitation_json, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        invitation_id = response.data["id"]

        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_INVITE_CREATED")), 1
        )

        # The Postdoc accepts the invitation
        self.client.force_authenticate(user=self.post_doc)

        response = self.client.patch(
            reverse("invitation-detail", args=[invitation_id]), {"status": "ACCEPTED"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORG_INVITE_ACCEPTED")), 1
        )

        # The PostDoc transfers the resource to PrimaryLab
        self.client.force_authenticate(user=self.post_doc)

        response = self.client.patch(
            reverse("material-detail", args=[material.id]),
            {"organization": self.primary_lab.id},
            format="json",
        )

        material.refresh_from_db()

        self.assertEqual(material.organization, self.primary_lab)

        # Final checks
        self.assertEqual(len(Notification.objects.all()), 2)
