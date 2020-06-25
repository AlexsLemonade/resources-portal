from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker
from guardian.shortcuts import assign_perm

from resources_portal.models import Attachment
from resources_portal.test.factories import AttachmentFactory, MaterialRequestFactory, UserFactory

fake = Faker()


class TestAttachmentListTestCase(APITestCase):
    """
    Tests /attachment list operations.
    """

    def setUp(self):
        self.url = reverse("attachment-list")
        self.attachment = AttachmentFactory()
        self.attachment_data = model_to_dict(self.attachment)
        self.attachment_data.pop("id")

        self.material_request = MaterialRequestFactory()

        self.user = self.material_request.requester
        self.user_without_request = UserFactory()

        self.user_in_org = UserFactory()
        org = self.material_request.material.organization
        org.members.add(self.user_in_org)
        assign_perm("approve_requests", self.user_in_org, org)

        self.admin = UserFactory()
        self.admin.is_staff = True

    def test_list_request_from_admin_succeeds(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_request_from_user_with_material_request_open_succeeds(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, self.attachment_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_post_request_from_user_in_organization_with_active_material_request_succeeds(self):
        self.client.force_authenticate(user=self.user_in_org)
        response = self.client.post(self.url, self.attachment_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_post_request_from_user_without_material_request_open_fails(self):
        self.client.force_authenticate(user=self.user)

        self.material_request.is_active = False
        self.material_request.save()

        response = self.client.post(self.url, self.attachment_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_request_from_user_without_any_material_request_fails(self):
        self.client.force_authenticate(user=self.user_without_request)
        response = self.client.post(self.url, self.attachment_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.attachment_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TestSingleAttachmentTestCase(APITestCase):
    """
    Tests /attachment detail operations.
    """

    def setUp(self):
        self.attachment = AttachmentFactory()

        self.url = reverse("attachment-detail", args=[self.attachment.id])

        self.material_request = MaterialRequestFactory()
        self.organization = self.material_request.material.organization

        self.requester = self.material_request.requester

        self.user = UserFactory()
        self.organization.members.add(self.user)

        self.user_without_request = UserFactory()

        assign_perm("approve_requests", self.user, self.organization)
        assign_perm("view_requests", self.user, self.organization)

        self.admin = UserFactory()
        self.admin.is_staff = True
        self.admin.save()

    def test_get_request_from_user_with_perms_succeeds(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_from_requester_with_perms_succeeds(self):
        self.client.force_authenticate(user=self.requester)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_from_user_without_perms_fails(self):
        self.client.force_authenticate(user=self.user_without_request)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_updates_a_attachment(self):
        self.client.force_authenticate(user=self.user)
        attachment_json = self.client.get(self.url).json()

        filename = "new_filename"
        attachment_json["filename"] = filename

        response = self.client.put(self.url, attachment_json)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.attachment.refresh_from_db()
        self.assertEqual(filename, self.attachment.filename)

    def test_put_request_from_user_without_perms_fails(self):
        self.client.force_authenticate(user=self.user_without_request)

        attachment_json = self.client.get(self.url).json()

        filename = "new_filename"
        attachment_json["filename"] = filename

        response = self.client.put(self.url, attachment_json)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)

        attachment_json = self.client.get(self.url).json()

        filename = "new_filename"
        attachment_json["filename"] = filename

        response = self.client.put(self.url, attachment_json)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_admin_succeeds(self):
        self.client.force_authenticate(user=self.admin)

        attachment_id = self.attachment.id
        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Attachment.objects.filter(id=attachment_id).count(), 0)

    def test_delete_request_from_user_succeeds(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_request_from_unauthorized_fails(self):
        self.client.force_authenticate(user=self.user_without_request)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
