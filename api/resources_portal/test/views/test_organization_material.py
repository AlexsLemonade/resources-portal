from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import User
from resources_portal.test.factories import OrganizationFactory, UserFactory

fake = Faker()


class OrganizationMaterialsTestCase(APITestCase):
    """
    Tests /organizations/<id>/materials operations.
    """

    def setUp(self):
        self.organization = OrganizationFactory()
        self.url = reverse("organization-detail", args=[self.organization.id])

    def test_get_single_material_not_allowed(self):
        self.client.force_authenticate(user=self.organization.members.first())
        material = self.organization.members.first()
        url = reverse("organizations-materials-detail", args=[self.organization.id, material.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)

    def test_get_request_returns_members(self):
        self.client.force_authenticate(user=self.organization.members.first())
        url = reverse("organizations-materials-list", args=[self.organization.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 2)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        url = reverse("organizations-materials-list", args=[self.organization.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
