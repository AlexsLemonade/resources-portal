from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.test.factories import MaterialFactory, OrganizationFactory

fake = Faker()


class OrganizationMaterialsTestCase(APITestCase):
    """
    Tests /organizations/<id>/materials operations.
    """

    def setUp(self):
        self.organization = OrganizationFactory()
        self.material1 = MaterialFactory()
        self.material2 = MaterialFactory()

    def test_get_material_with_id_not_found(self):
        self.client.force_authenticate(user=self.organization.members.first())
        url = reverse("organizations-materials-detail", args=[self.organization.id, 1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_get_request_returns_materials(self):
        self.client.force_authenticate(user=self.organization.members.first())

        self.organization.materials.add(self.material1)
        self.organization.materials.add(self.material2)

        url = reverse("organizations-materials-list", args=[self.organization.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 2)
