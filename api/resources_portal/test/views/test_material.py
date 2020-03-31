from django.contrib.auth.hashers import check_password
from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

import factory
from faker import Faker
from nose.tools import eq_, ok_

from resources_portal.models import Material, User
from resources_portal.test.factories import MaterialFactory, OrganizationFactory, UserFactory

fake = Faker()


class TestMaterialListTestCase(APITestCase):
    """
    Tests /materials list operations.
    """

    def setUp(self):
        self.url = reverse("material-list")
        self.user = UserFactory()
        self.organization = OrganizationFactory()
        self.material = MaterialFactory(contact_user=self.user, organization=self.organization)
        self.material_data = model_to_dict(self.material)

    def test_post_request_with_no_data_fails(self):
        response = self.client.post(self.url, {})
        eq_(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        response = self.client.post(self.url, self.material_data, format="json")
        eq_(response.status_code, status.HTTP_201_CREATED)

        eq_(self.material.category, response.json()["category"])


class TestSingleMaterialTestCase(APITestCase):
    """
    Tests /materials detail operations.
    """

    def setUp(self):
        self.material = MaterialFactory()
        self.url = reverse("material-detail", args=[self.material.id])

    def test_get_request_returns_a_given_material(self):
        response = self.client.get(self.url)
        eq_(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_a_material(self):
        # TODO: this should require authentication.
        material_json = self.client.get(self.url).json()
        new_url = fake.url()
        material_json["url"] = new_url
        response = self.client.put(self.url, material_json)
        eq_(response.status_code, status.HTTP_200_OK)

        material = Material.objects.get(pk=self.material.id)
        eq_(material.url, new_url)
