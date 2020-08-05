from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import MaterialRequest, Notification, OrganizationUserSetting
from resources_portal.test.factories import (
    AddressFactory,
    AttachmentFactory,
    MaterialRequestFactory,
    OrganizationFactory,
    UserFactory,
)

fake = Faker()


class TestMaterialRequestListTestCase(APITestCase):
    """
    Tests /materials list operations.
    """

    def setUp(self):
        self.url = reverse("material-request-list")
        self.request = MaterialRequestFactory()

        self.sharer = self.request.material.contact_user
        self.organization = self.request.material.organization
        self.request.material.save()

        self.organization.members.add(self.sharer)
        self.organization.assign_member_perms(self.sharer)
        self.organization.assign_owner_perms(self.sharer)

        self.material_request_data = model_to_dict(self.request)

        self.user_without_perms = UserFactory()

    def test_post_request_with_no_data_fails(self):
        self.client.force_authenticate(user=self.request.requester)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        response = self.client.post(self.url, self.material_request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="TRANSFER_REQUESTED", email=self.sharer.email
                )
            ),
            1,
        )

    def test_post_request_with_address_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        address = AddressFactory()
        self.material_request_data["address"] = address.id

        response = self.client.post(self.url, self.material_request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="TRANSFER_REQUESTED", email=self.sharer.email
                )
            ),
            1,
        )

        created_request = MaterialRequest.objects.get(id=response.json()["id"])
        self.assertEqual(created_request.address.id, address.id)

    def test_post_request_with_valid_data_fails_if_archived(self):
        self.request.material.is_archived = True
        self.request.material.save()

        self.client.force_authenticate(user=self.request.requester)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        response = self.client.post(self.url, self.material_request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.material_request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_request_from_sharer_succeeds(self):
        self.client.force_authenticate(user=self.sharer)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_from_requester_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_filters(self):
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 0)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TestSingleMaterialRequestTestCase(APITestCase):
    def setUp(self):
        self.request = MaterialRequestFactory()
        self.url = reverse("material-request-detail", args=[self.request.id])
        self.material_request_data = model_to_dict(self.request)

        self.request2 = MaterialRequestFactory()

        self.sharer = self.request.material.contact_user
        self.organization = OrganizationFactory()
        self.organization.materials.add(self.request.material)
        self.organization.members.add(self.sharer)
        self.organization.assign_member_perms(self.sharer)
        self.organization.assign_owner_perms(self.sharer)

        self.other_member = UserFactory()
        self.organization.members.add(self.other_member)
        self.organization.assign_member_perms(self.other_member)
        self.organization.assign_owner_perms(self.other_member)

        self.user_without_perms = UserFactory()

        self.admin = UserFactory()
        self.admin.is_superuser = True

    def test_get_request_from_sharer_succeeds(self):
        self.client.force_authenticate(user=self.sharer)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_from_requester_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_without_perms_fails(self):
        self.client.force_authenticate(user=self.user_without_perms)
        url = reverse("material-request-detail", args=[self.request.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_sharer_updates_a_material_request(self):
        self.client.force_authenticate(user=self.sharer)

        sharer_org = OrganizationFactory()
        sharer_org.members.add(self.sharer)
        sharer_org.save()

        self.material_request_data["status"] = "APPROVED"
        self.material_request_data["executed_mta_attachment"] = AttachmentFactory(
            owned_by_org=sharer_org
        ).id

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_request = MaterialRequest.objects.get(pk=self.request.id)
        self.assertEqual(material_request.status, "APPROVED")

    def test_put_request_from_requester_updates_a_material_request(self):
        self.client.force_authenticate(user=self.request.requester)

        irb_attachment = AttachmentFactory(owned_by_user=self.request.requester)

        self.material_request_data["irb_attachment"] = irb_attachment.id
        self.material_request_data["requester_signed_mta_attachment"] = AttachmentFactory(
            owned_by_user=self.request.requester
        ).id

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_request = MaterialRequest.objects.get(pk=self.request.id)
        self.assertEqual(material_request.irb_attachment, irb_attachment)

    def test_put_request_from_requester_verifies_request(self):
        # Make the request fulfilled, so it can be verified.
        self.request.status = "FULFILLED"
        self.request.save()

        self.client.force_authenticate(user=self.request.requester)

        self.material_request_data["status"] = "VERIFIED_FULFILLED"

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_request = MaterialRequest.objects.get(pk=self.request.id)
        self.assertEqual(material_request.status, "VERIFIED_FULFILLED")

    def test_put_request_from_sharer_does_not_verify_request(self):
        # Make the request fulfilled, so it could be verified.
        self.request.status = "FULFILLED"
        self.request.save()

        self.client.force_authenticate(user=self.sharer)

        self.material_request_data["status"] = "VERIFIED_FULFILLED"

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_user_who_does_not_own_attachment_fails(self):
        self.client.force_authenticate(user=self.request.requester)

        irb_attachment = AttachmentFactory()

        self.material_request_data["irb_attachment"] = irb_attachment.id

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_updates_assigned_to(self):
        self.client.force_authenticate(user=self.other_member)
        self.material_request_data["assigned_to"] = self.other_member.id

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated_request = MaterialRequest.objects.get(id=self.request.id)
        self.assertEqual(updated_request.assigned_to, self.other_member)

    def test_put_request_from_requester_does_not_update_assigned_to(self):
        self.client.force_authenticate(user=self.request.requester)
        self.material_request_data["assigned_to"] = self.other_member.id

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)

        self.material_request_data["status"] = "APPROVED"

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)

        self.material_request_data["status"] = "APPROVED"

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_deletes_a_material(self):
        self.client.force_authenticate(user=self.admin)
        request_id = self.request.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(MaterialRequest.objects.filter(id=request_id).count(), 0)

    def test_delete_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
