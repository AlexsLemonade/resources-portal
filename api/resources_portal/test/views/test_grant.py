from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Grant, User
from resources_portal.test.factories import (
    GrantFactory,
    LeafGrantFactory,
    MaterialFactory,
    UserFactory,
)

fake = Faker()


class TestGrantPostTestCase(APITestCase):
    """
    Tests /grants list operations.
    """

    def setUp(self):
        self.url = reverse("grant-list")
        self.grant = LeafGrantFactory()

    def test_post_request_with_no_data_fails(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        grant_data = model_to_dict(self.grant)

        response = self.client.post(self.url, grant_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class TestSingleGrantTestCase(APITestCase):
    """
    Tests /grants detail operations.
    """

    def setUp(self):
        self.grant = GrantFactory()
        self.url = reverse("grant-detail", args=[self.grant.id])

    def test_get_request_returns_a_given_grant(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_a_grant(self):
        grant_json = self.client.get(self.url).json()

        new_title = "New Title"
        new_funder_id = "YYY-YYY-YYY"
        grant_json["title"] = new_title
        grant_json["funder_id"] = new_funder_id

        # Test that users won't be updated.
        new_member = UserFactory()
        new_member_json = {"id": new_member.id}
        grant_json["users"].append(new_member_json)

        # TODO: this should require authentication
        response = self.client.put(self.url, grant_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.grant.refresh_from_db()
        self.assertEqual(new_title, self.grant.title)
        self.assertEqual(new_funder_id, self.grant.funder_id)

        # This was ignored, requires using the relationship endpoiint.
        new_member = User.objects.get(id=new_member.id)
        self.assertNotIn(new_member, self.grant.users.all())


class GrantMaterialsTestCase(APITestCase):
    """
    Tests /grants/<id>/materials operations.
    """

    def setUp(self):
        self.grant = GrantFactory()
        self.url = reverse("grant-detail", args=[self.grant.id])

    def test_get_request_returns_a_given_grant(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_returns_materials(self):
        url = reverse("grant-list-materials", args=[self.grant.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 2)

    def test_cannot_post_to_grant_materials(self):
        url = reverse("grant-list-materials", args=[self.grant.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 405)

    def test_post_request_associates_a_material(self):
        material = MaterialFactory()
        url = reverse("grant-associate-material", args=[self.grant.id, material.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.grant.refresh_from_db()
        self.assertIn(material, self.grant.materials.all())

    def test_delete_request_disassociates_a_material(self):
        material = self.grant.materials.first()
        url = reverse("grant-associate-material", args=[self.grant.id, material.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.grant.refresh_from_db()
        self.assertNotIn(material, self.grant.materials.all())

    def test_cannot_put_a_relationship(self):
        material = MaterialFactory()
        url = reverse("grant-associate-material", args=[self.grant.id, material.id])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 405)
