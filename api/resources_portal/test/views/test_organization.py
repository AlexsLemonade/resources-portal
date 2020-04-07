from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

import factory
from faker import Faker

from resources_portal.models import Organization, User
from resources_portal.test.factories import (
    OrganizationFactory,
    PersonalOrganizationFactory,
    UserFactory,
)

fake = Faker()


class TestOrganizationListTestCase(APITestCase):
    """
    Tests /organizations list operations.
    """

    def setUp(self):
        self.url = reverse("organization-list")
        self.member1 = UserFactory()
        self.member2 = UserFactory()
        # I don't yet understand why this needs to be:
        self.organization = PersonalOrganizationFactory()
        # instead of:
        # self.organization_data = factory.build(dict, FACTORY_CLASS=OrganizationFactory)

    def test_post_request_with_no_data_fails(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        organization_data = model_to_dict(self.organization)
        organization_data["members"] = [self.member1.pk, self.member2.pk]

        response = self.client.post(self.url, organization_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(self.organization.owner.id, response.json()["owner"])


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

        # new_member = UserFactory()
        new_member_json = factory.build(dict, FACTORY_CLASS=UserFactory)
        organization_json["members"].append(new_member_json)


        # TODO: this should require authentication
        response = self.client.put(self.url, organization_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        new_member = User.objects.get(id=new_member_json["id"])
        organization = Organization.objects.get(pk=self.organization.id)
        self.assertIn(new_member, organization.members.all())
