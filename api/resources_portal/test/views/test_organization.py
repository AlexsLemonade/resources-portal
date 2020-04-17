from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Organization, User
from resources_portal.test.factories import (
    OrganizationFactory,
    PersonalOrganizationFactory,
    UserFactory,
)

fake = Faker()


class TestOrganizationPostTestCase(APITestCase):
    """
    Tests /organizations list operations.
    """

    def setUp(self):
        self.url = reverse("organization-list")
        self.organization = PersonalOrganizationFactory()

    def test_post_request_with_no_data_fails(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        organization_data = model_to_dict(self.organization)

        organization_data["owner"] = {"id": organization_data["owner"]}

        response = self.client.post(self.url, organization_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(str(self.organization.owner.id), response.json()["owner"]["id"])


class TestSingleOrganizationTestCase(APITestCase):
    """
    Tests /organizations detail operations.
    """

    def setUp(self):
        self.organization = OrganizationFactory()
        self.url = reverse("organization-detail", args=[self.organization.id])

    def test_get_request_returns_a_given_organization(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_a_organization(self):
        organization_json = self.client.get(self.url).json()

        new_member = UserFactory()
        new_member_json = {"id": new_member.id}
        # The lab gets sold to a new owner or something...
        organization_json["owner"] = new_member_json
        organization_json["members"].append(new_member_json)

        # TODO: this should require authentication
        response = self.client.put(self.url, organization_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        new_member = User.objects.get(id=new_member.id)
        self.organization.refresh_from_db()
        self.assertIn(new_member, self.organization.members.all())
        self.assertEqual(new_member, self.organization.owner)

    def test_put_owner_is_added_to_members(self):
        organization_json = self.client.get(self.url).json()

        new_member = UserFactory()
        new_member_json = {"id": new_member.id}
        # This is an important difference from the previous test: the
        # owner isn't listed as a member.
        organization_json["owner"] = new_member_json

        # TODO: this should require authentication
        response = self.client.put(self.url, organization_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        new_member = User.objects.get(id=new_member.id)
        self.organization.refresh_from_db()
        self.assertIn(new_member, self.organization.members.all())
        self.assertEqual(new_member, self.organization.owner)

    def test_put_cannot_add_invalid_user(self):
        organization_json = self.client.get(self.url).json()

        new_member_json = {"id": "invalid"}
        # The lab gets sold to a new owner or something...
        organization_json["owner"] = new_member_json
        organization_json["members"].append(new_member_json)

        # TODO: this should require authentication
        response = self.client.put(self.url, organization_json)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
