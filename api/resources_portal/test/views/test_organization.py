from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Notification, Organization
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

    def test_list_succeeds(self):
        self.client.force_authenticate(user=self.organization.owner)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_post_request_with_no_data_fails(self):
        self.client.force_authenticate(user=self.organization.owner)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        user = self.organization.owner
        self.assertEqual(user.organizations.count(), 1)
        self.client.force_authenticate(user=user)

        # members can be empty and the owner should still become a member.
        organization_data = {
            "name": "test org",
            "description": "My org.",
            "members": [],
            "owner": {"id": user.id},
        }

        response = self.client.post(self.url, organization_data, format="json")
        response_json = response.json()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(str(user.id), response_json["owner"]["id"])
        self.assertEqual(user.organizations.count(), 2)
        self.assertIn(str(user.id), [member["id"] for member in response_json["members"]])


class TestSingleOrganizationTestCase(APITestCase):
    """
    Tests /organizations detail operations.
    """

    def setUp(self):
        self.organization = OrganizationFactory()
        self.url = reverse("organization-detail", args=[self.organization.id])

    def test_get_request_returns_a_given_organization(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_requires_account(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_put_request_fails_by_non_owner(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)
        organization_json = self.client.get(self.url).json()

        new_member = UserFactory()
        new_member_json = {"id": new_member.id}
        # Someone is trying to steal the lab!!!
        organization_json["owner"] = new_member_json
        organization_json["members"].append(new_member_json)

        response = self.client.put(self.url, organization_json)
        self.assertEqual(response.status_code, 403)

        self.organization.refresh_from_db()
        self.assertNotIn(new_member, self.organization.members.all())
        self.assertNotEqual(new_member, self.organization.owner)

    def test_put_request_updates_an_organization(self):
        self.client.force_authenticate(user=self.organization.owner)
        organization_json = self.client.get(self.url).json()

        new_owner = UserFactory()
        old_owner = self.organization.owner
        # The new owner must belong to the organization already.
        self.organization.members.add(new_owner)
        new_owner_json = {"id": new_owner.id}
        # The lab gets sold to a new owner or something...
        organization_json["owner"] = new_owner_json
        new_name = "Mine now!"
        organization_json["name"] = new_name

        # And we try to add a member of the new owner's lab or something...
        new_member = UserFactory()
        new_member_json = {"id": new_member.id}
        organization_json["members"] = [new_member_json]

        response = self.client.put(self.url, organization_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.organization.refresh_from_db()
        # The owner always gets added to the members list:
        self.assertIn(new_owner, self.organization.members.all())
        self.assertEqual(new_owner, self.organization.owner)
        self.assertEqual(new_name, self.organization.name)

        # The owner has owner perms, old owner is downgraded to member
        self.assertTrue(new_owner.has_perm("add_members", self.organization))
        self.assertFalse(old_owner.has_perm("add_members", self.organization))

        # But adding members requires a request to the nested route:
        self.assertNotIn(new_member, self.organization.members.all())

        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORGANIZATION_BECAME_OWNER")), 1,
        )
        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORGANIZATION_NEW_OWNER")),
            self.organization.members.count() - 1,
        )

    def test_put_owner_fails_if_not_member(self):
        """The new owner must belong to the organization already."""
        self.client.force_authenticate(user=self.organization.owner)
        organization_json = self.client.get(self.url).json()

        new_owner = UserFactory()
        new_owner_json = {"id": new_owner.id}
        # Ahhh! A user is trying to steal the lab!!!
        organization_json["owner"] = new_owner_json

        response = self.client.put(self.url, organization_json)
        self.assertEqual(response.status_code, 400)

        self.organization.refresh_from_db()
        self.assertNotIn(new_owner, self.organization.members.all())
        self.assertNotEqual(new_owner, self.organization.owner)

    def test_put_cannot_add_invalid_user(self):
        self.client.force_authenticate(user=self.organization.owner)
        organization_json = self.client.get(self.url).json()

        new_member_json = {"id": "invalid"}
        # The lab gets sold to a new owner or something...
        organization_json["owner"] = new_member_json
        organization_json["members"].append(new_member_json)

        response = self.client.put(self.url, organization_json)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_by_owner(self):
        self.client.force_authenticate(user=self.organization.owner)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Organization.objects.count(), 0)

    def test_delete_only_soft_deletes(self):
        self.client.force_authenticate(user=self.organization.owner)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Organization.deleted_objects.count(), 1)
