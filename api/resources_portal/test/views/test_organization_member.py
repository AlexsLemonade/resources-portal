from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import User
from resources_portal.test.factories import OrganizationFactory, UserFactory

fake = Faker()


class OrganizationMembersTestCase(APITestCase):
    """
    Tests /organizations/<id>/members operations.
    """

    def setUp(self):
        self.organization = OrganizationFactory()
        self.url = reverse("organization-detail", args=[self.organization.id])

    def test_get_single_user_not_allowed(self):
        self.client.force_authenticate(user=self.organization.members.first())
        user = self.organization.members.first()
        url = reverse("organizations-members-detail", args=[self.organization.id, user.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)

    def test_get_request_returns_members(self):
        self.client.force_authenticate(user=self.organization.members.first())
        url = reverse("organizations-members-list", args=[self.organization.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 2)

    def test_get_fails_if_not_member(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)
        url = reverse("organizations-members-list", args=[self.organization.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_post_is_not_allowed(self):
        user = self.organization.members.first()

        self.client.force_authenticate(user=user)

        user_json = model_to_dict(user)
        user_json.pop("organizations")
        url = reverse("organizations-members-list", args=[self.organization.id])
        response = self.client.post(url, data=user_json)

        self.assertEqual(response.status_code, 405)

    def test_delete_self_from_org(self):
        user = UserFactory()
        self.organization.members.add(user)
        self.client.force_authenticate(user=user)
        url = reverse("organizations-members-detail", args=[self.organization.id, user.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)

        self.organization.refresh_from_db()
        self.assertNotIn(user, self.organization.members.all())
        # Verify that the user was not deleted, just its relationship
        User.objects.get(pk=user.id)

    def test_delete_by_owner(self):
        member = UserFactory()
        self.organization.members.add(member)
        self.organization.save()
        self.client.force_authenticate(user=self.organization.owner)

        url = reverse("organizations-members-detail", args=[self.organization.id, member.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertNotIn(member, self.organization.members.all())

    def test_delete_fails_for_non_owner(self):
        """user1 fails to remove user2"""
        user1 = UserFactory()
        user2 = UserFactory()
        self.organization.members.add(user1)
        self.organization.members.add(user2)
        self.client.force_authenticate(user=user1)

        url = reverse("organizations-members-detail", args=[self.organization.id, user2.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)
        self.assertIn(user2, self.organization.members.all())

    def test_delete_owner_fails(self):
        user = self.organization.owner
        self.client.force_authenticate(user=user)

        url = reverse("organizations-members-detail", args=[self.organization.id, user.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 400)
        self.assertIn(user, self.organization.members.all())

    def test_cannot_put_a_relationship(self):
        self.client.force_authenticate(user=self.organization.members.first())
        user = UserFactory()
        url = reverse("organizations-members-detail", args=[self.organization.id, user.id])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 405)
