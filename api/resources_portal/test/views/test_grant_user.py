from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker
from guardian.shortcuts import assign_perm

from resources_portal.models import User
from resources_portal.test.factories import GrantFactory, UserFactory

fake = Faker()


class GrantUsersTestCase(APITestCase):
    """
    Tests /grants/<id>/users operations.
    """

    def setUp(self):
        self.user_without_perms = UserFactory()
        self.org_1_member = UserFactory()
        self.org_2_member = UserFactory()

        self.grant = GrantFactory()

        self.owner_1 = self.grant.users.first()
        self.owner_2 = self.grant.users.last()

        self.organization_1 = self.grant.organizations.first()
        self.organization_1.members.add(self.org_1_member)

        self.organization_2 = self.grant.organizations.last()
        self.organization_2.members.add(self.org_2_member)

        assign_perm("add_members_and_manage_permissions", self.owner_1, self.organization_1)
        assign_perm("add_members_and_manage_permissions", self.owner_2, self.organization_2)

        self.url = reverse("grant-detail", args=[self.grant.id])

    def test_get_single_user_not_allowed(self):
        self.client.force_authenticate(user=self.owner_1)
        url = reverse("grants-user-detail", args=[self.grant.id, self.owner_1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)

    def test_get_request_returns_users(self):
        self.client.force_authenticate(user=self.owner_1)
        url = reverse("grants-user-list", args=[self.grant.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 2)

    def test_get_fails_if_not_owner(self):
        self.client.force_authenticate(user=self.user_without_perms)
        url = reverse("grants-user-list", args=[self.grant.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_get_request_fails_if_unauthenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse("grants-user-list", args=[self.grant.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_post_request_associates_a_user(self):
        self.client.force_authenticate(user=self.owner_1)

        url = reverse("grants-user-list", args=[self.grant.id])
        response = self.client.post(url, data={"id": self.org_1_member.id})

        self.assertEqual(response.status_code, 201)
        self.assertIn(self.org_1_member, self.grant.users.all())

    def test_post_request_on_non_first_organization_succeeds(self):
        self.client.force_authenticate(user=self.owner_2)

        url = reverse("grants-user-list", args=[self.grant.id])
        response = self.client.post(url, data={"id": self.org_2_member.id})

        self.assertEqual(response.status_code, 201)
        self.assertIn(self.org_2_member, self.grant.users.all())

    def test_post_request_on_user_not_in_associated_organization_fails(self):
        self.client.force_authenticate(user=self.owner_1)

        url = reverse("grants-user-list", args=[self.grant.id])
        response = self.client.post(url, data={"id": self.user_without_perms.id})

        self.assertEqual(response.status_code, 403)

    def test_post_request_from_user_without_organization_permissions_fails(self):
        self.client.force_authenticate(user=self.owner_1)

        url = reverse("grants-user-list", args=[self.grant.id])
        # Owner 1 does not have add members permissions for org 2
        response = self.client.post(url, data={"id": self.org_2_member.id})

        self.assertEqual(response.status_code, 403)

    def test_post_request_fails_if_unauthenticated(self):
        self.client.force_authenticate(user=None)

        url = reverse("grants-user-list", args=[self.grant.id])
        response = self.client.post(url, data={"id": self.org_1_member.id})

        self.assertEqual(response.status_code, 403)

    def test_delete_request_disassociates_a_material(self):
        self.client.force_authenticate(user=self.owner_1)
        url = reverse("grants-user-detail", args=[self.grant.id, self.owner_2])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)

        self.grant.refresh_from_db()
        self.assertNotIn(self.owner_2, self.grant.users.all())
        # Verify that the user was not deleted, just its relationship
        User.objects.get(pk=self.owner_2.id)

    def test_delete_fails_if_not_grant_owner(self):
        self.client.force_authenticate(user=self.user_without_perms)

        url = reverse("grants-user-detail", args=[self.grant.id, self.owner_1])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)

    def test_delete_fails_if_unauthenticated(self):
        self.client.force_authenticate(user=None)

        url = reverse("grants-user-detail", args=[self.grant.id, self.owner_1])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)

    def test_cannot_put_a_relationship(self):
        self.client.force_authenticate(user=self.owner_1)
        url = reverse("grants-material-detail", args=[self.grant.id, self.user_without_perms.id])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 405)
