from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Material
from resources_portal.test.factories import MaterialFactory, OrganizationFactory, UserFactory

fake = Faker()


class TestSingleOrganizationUserSettingTestCase(APITestCase):
    """
    Tests /materials detail operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.user_without_perms = UserFactory()
        self.organization = OrganizationFactory(owner=self.user)
        self.organization2 = OrganizationFactory(owner=self.user)
        self.organization_without_perms = OrganizationFactory()
        self.material = MaterialFactory(contact_user=self.user, organization=self.organization)
        self.url = reverse("material-detail", args=[self.material.id])

    def test_get_request_returns_a_given_material(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_a_material(self):
        self.client.force_authenticate(user=self.user)
        material_json = self.client.get(self.url).json()

        new_url = fake.url()
        material_json["url"] = new_url
        material_json["contact_user"] = material_json["contact_user"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material = Material.objects.get(pk=self.material.id)
        self.assertEqual(material.url, new_url)

    def test_put_request_can_update_organization(self):
        self.client.force_authenticate(user=self.user)
        material_json = self.client.get(self.url).json()

        material_json["organization"] = self.organization2.id
        material_json["contact_user"] = material_json["contact_user"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertTrue(self.material in self.organization2.materials.all())

    def test_put_request_on_organization_without_permissions_for_both_orgs_fails(self):
        self.client.force_authenticate(user=self.user)
        material_json = self.client.get(self.url).json()

        material_json["organization"] = self.organization_without_perms.id
        material_json["contact_user"] = material_json["contact_user"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)
        material_json = self.client.get(self.url).json()

        new_url = fake.url()
        material_json["url"] = new_url
        material_json["contact_user"] = material_json["contact_user"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        material_json = self.client.get(self.url).json()

        new_url = fake.url()
        material_json["url"] = new_url
        material_json["contact_user"] = material_json["contact_user"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_deletes_a_material(self):
        self.client.force_authenticate(user=self.user)
        material_id = self.material.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Material.objects.filter(id=material_id).count(), 0)

    def test_delete_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
