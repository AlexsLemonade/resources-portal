from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Material
from resources_portal.test.factories import MaterialFactory, OrganizationFactory, UserFactory

fake = Faker()


class TestMaterialListTestCase(APITestCase):
    """
    Tests /materials list operations.
    """

    def setUp(self):
        self.url = reverse("material-list")
        self.user = UserFactory()
        self.organization = OrganizationFactory(owner=self.user)
        self.material = MaterialFactory(contact_user=self.user, organization=self.organization)
        self.material_data = model_to_dict(self.material)

    def test_post_request_with_no_data_fails(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        response = self.client.post(self.url, self.material_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(self.material.category, response.json()["category"])


class TestSingleMaterialTestCase(APITestCase):
    """
    Tests /materials detail operations.
    """

    def setUp(self):
        self.material = MaterialFactory()
        self.url = reverse("material-detail", args=[self.material.id])

    def test_get_request_returns_a_given_material(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_a_material(self):
        material_json = self.client.get(self.url).json()

        new_url = fake.url()
        material_json["url"] = new_url
        material_json["contact_user"] = material_json["contact_user"]["id"]

        # TODO: this should require authentication
        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material = Material.objects.get(pk=self.material.id)
        self.assertEqual(material.url, new_url)
