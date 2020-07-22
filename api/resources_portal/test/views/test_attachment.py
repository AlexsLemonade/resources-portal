from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker
from guardian.shortcuts import assign_perm

from resources_portal.models import Attachment
from resources_portal.test.factories import AttachmentFactory, MaterialRequestFactory, UserFactory
from resources_portal.test.utils import clean_test_file_uploads

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

        self.user = UserFactory()

        self.admin = UserFactory()
        self.admin.is_staff = True

        clean_test_file_uploads()

    def test_list_request_from_admin_succeeds(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_request_from_non_admin_fails(self):
        self.client.force_authenticate(user=self.user)

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            data = {**self.attachment_data, "file": fp}
            data.pop("sequence_map_for")
            response = self.client.post(self.url, data, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get(response.json()["download_url"])

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.content), 157844)

    def test_post_request_from_authenticated_succeeds(self):
        self.client.force_authenticate(user=self.user)

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            data = {**self.attachment_data, "file": fp}
            data.pop("sequence_map_for")
            response = self.client.post(self.url, data, format="multipart")

        import pdb

        pdb.set_trace()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_post_request_from_unauthenticated_user_fails(self):
        self.client.force_authenticate(user=None)

        with open("dev_data/nerd_sniping.png", "rb") as fp:
            data = {**self.attachment_data, "file": fp}
            data.pop("sequence_map_for")
            response = self.client.post(self.url, data, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TestSingleAttachmentTestCase(APITestCase):
    """
    Tests /attachment detail operations.
    """

    def setUp(self):
        self.attachment = AttachmentFactory()
        self.attachment_json = model_to_dict(self.attachment)
        self.attachment_json.pop("sequence_map_for")
        self.attachment_json.pop("owned_by_org")

        self.url = reverse("attachment-detail", args=[self.attachment.id])

        self.organization = self.attachment.owned_by_org

        self.user = self.attachment.owned_by_user

        self.user_in_org = UserFactory()
        self.organization.members.add(self.user_in_org)
        self.organization.save()

        self.non_owner = UserFactory()

        self.admin = UserFactory()
        self.admin.is_staff = True
        self.admin.save()

    def test_get_request_from_owning_user_succeeds(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_from_member_of_owning_org_succeeds(self):
        self.client.force_authenticate(user=self.user_in_org)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_from_non_owner_fails(self):
        self.client.force_authenticate(user=self.non_owner)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_owning_user_succeeds(self):
        self.client.force_authenticate(user=self.user)

        description = "A different description."
        self.attachment_json["description"] = description

        response = self.client.put(self.url, self.attachment_json, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.attachment.refresh_from_db()
        self.assertEqual(description, self.attachment.description)

    def test_put_request_from_member_of_owning_org_succeeds(self):
        self.client.force_authenticate(user=self.user_in_org)

        description = "A different description."
        self.attachment_json["description"] = description

        response = self.client.put(self.url, self.attachment_json, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.attachment.refresh_from_db()
        self.assertEqual(description, self.attachment.description)

    def test_put_request_from_user_not_in_organization_fails(self):
        self.client.force_authenticate(user=self.non_owner)

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

    def test_delete_request_from_owning_user_succeeds(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_request_from_member_of_owning_org_succeeds(self):
        self.client.force_authenticate(user=self.user_in_org)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_request_from_unauthorized_fails(self):
        self.client.force_authenticate(user=self.non_owner)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
