from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import User
from resources_portal.test.factories import OrganizationFactory, UserFactory
from resources_portal.views.relation_serializers import OrganizationRelationSerializer

fake = Faker()


class OrganizationMembersTestCase(APITestCase):
    """
    Tests /organizations/<id>/members operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.member = UserFactory()
        self.organization = OrganizationFactory(owner=self.user)

        self.member_organization = OrganizationFactory()
        self.member_organization.members.add(self.user)
        self.member_organization.members.add(self.member)
        self.member_organization.save()

        self.user_without_perms = UserFactory()
        self.url = reverse("user-detail", args=[self.organization.id])

    def test_get_single_organization_not_allowed(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("users-organizations-detail", args=[self.user.id, self.organization.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)

    def test_get_request_returns_organizations(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("users-organizations-list", args=[self.user.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 2)

    def test_post_is_not_allowed(self):
        self.client.force_authenticate(user=self.user)

        organization_json = model_to_dict(self.organization)

        member_list = []
        for member in organization_json["members"]:
            member_list.append(member.id)
        organization_json["members"] = member_list

        url = reverse("users-organizations-list", args=[self.user.id])
        response = self.client.post(url, data=organization_json)

        self.assertEqual(response.status_code, 405)

    def test_delete_self_from_org(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "users-organizations-detail", args=[self.user.id, self.member_organization.id]
        )
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)

        self.organization.refresh_from_db()
        self.assertNotIn(self.user, self.member_organization.members.all())
        # Verify that the user was not deleted, just its relationship
        User.objects.get(pk=self.user.id)

    def test_delete_by_owner(self):
        self.client.force_authenticate(user=self.user)

        self.organization.members.add(self.member)
        self.organization.save()

        url = reverse("users-organizations-detail", args=[self.member.id, self.organization.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertNotIn(self.member, self.organization.members.all())

    def test_delete_fails_for_non_owner(self):
        self.client.force_authenticate(user=self.member)

        new_member = UserFactory()
        self.member_organization.members.add(new_member)
        self.member_organization.save()

        url = reverse(
            "users-organizations-detail", args=[new_member.id, self.member_organization.id]
        )
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)
        self.assertIn(self.user, self.organization.members.all())

    def test_delete_owner_fails(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("users-organizations-detail", args=[self.user.id, self.organization.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 400)
        self.assertIn(self.user, self.organization.members.all())

    def test_cannot_put_a_relationship(self):
        self.client.force_authenticate(user=self.user)
        new_org = OrganizationFactory()
        url = reverse("users-organizations-detail", args=[self.user.id, new_org.id])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 405)
