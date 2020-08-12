from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Grant
from resources_portal.test.factories import GrantFactory, UserFactory

fake = Faker()


class OrganizationGrantTestCase(APITestCase):
    """
    Tests /organizations/<id>/grants operations.
    """

    def setUp(self):
        self.grant = GrantFactory()
        self.grant2 = GrantFactory()

        grant_orgs = self.grant.organizations.all()
        self.organization1 = grant_orgs[0]
        self.organization2 = grant_orgs[1]
        self.org_1_member = UserFactory()
        self.organization1.members.add(self.org_1_member)
        self.organization1.grants.add(self.grant2)
        self.organization1.save()

        self.grant.user = self.organization1.owner
        self.grant.save()

        self.url = reverse("organization-detail", args=[self.grant.id])

    def test_get_single_organization_not_allowed(self):
        self.client.force_authenticate(user=self.organization1.owner)
        url = reverse("organizations-grants-detail", args=[self.organization1.id, self.grant.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)

    def test_get_request_from_owner_returns_grants(self):
        self.client.force_authenticate(user=self.organization1.owner)
        url = reverse("organizations-grants-list", args=[self.organization1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 2)

    def test_get_request_from_member_returns_grants(self):
        self.client.force_authenticate(user=self.org_1_member)
        url = reverse("organizations-grants-list", args=[self.organization1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 2)

    def test_get_fails_if_not_member_or_owner(self):
        self.client.force_authenticate(user=self.organization1.owner)
        url = reverse("organizations-grants-list", args=[self.organization2.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_get_fails_if_not_authenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse("organizations-grants-list", args=[self.organization1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_post_request_associates_a_grant(self):
        self.client.force_authenticate(user=self.organization1.owner)

        grant = GrantFactory()
        grant.user = self.organization1.owner
        grant.save()

        org_grant_url = reverse("organizations-grants-list", args=[self.organization1.id])
        grant_url = reverse("grant-detail", args=[grant.id])
        grant_json = self.client.get(grant_url).json()

        response = self.client.post(org_grant_url, data=grant_json)

        self.assertEqual(response.status_code, 201)
        self.assertIn(grant, self.organization1.grants.all())

    def test_post_fails_if_not_grant_owner(self):
        grant = GrantFactory()
        grant.save()

        self.client.force_authenticate(user=grant.user)
        grant_url = reverse("grant-detail", args=[grant.id])
        grant_json = self.client.get(grant_url).json()

        self.client.force_authenticate(user=self.organization1.owner)
        url = reverse("organizations-grants-list", args=[self.organization1.id])

        response = self.client.post(url, data=grant_json)

        self.assertEqual(response.status_code, 403)

    def test_post_fails_if_not_organization_owner(self):
        grant = GrantFactory()
        grant.user = self.organization1.owner
        grant.save()

        # sign in as org1 owner so we can get grant
        self.client.force_authenticate(user=self.organization1.owner)
        grant_url = reverse("grant-detail", args=[grant.id])
        grant_json = self.client.get(grant_url).json()

        # then sign in as owner to diff org
        self.client.force_authenticate(user=self.organization2.owner)
        url = reverse("organizations-grants-list", args=[self.organization1.id])

        response = self.client.post(url, data=grant_json)

        self.assertEqual(response.status_code, 403)

    def test_post_fails_if_not_authenticated(self):
        self.client.force_authenticate(user=None)

        grant = GrantFactory()

        url = reverse("organizations-grants-list", args=[self.organization1.id])
        grant_url = reverse("grant-detail", args=[grant.id])
        grant_json = self.client.get(grant_url).json()

        response = self.client.post(url, data=grant_json)

        self.assertEqual(response.status_code, 403)

    def test_delete_request_disassociates_a_material(self):
        self.client.force_authenticate(user=self.organization1.owner)
        url = reverse("organizations-grants-detail", args=[self.organization1.id, self.grant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)

        self.grant.refresh_from_db()
        self.assertNotIn(self.grant, self.organization1.grants.all())
        # Verify that the grant was not deleted, just its relationship
        Grant.objects.get(pk=self.grant.id)

    def test_delete_fails_if_not_grant_owner(self):
        self.client.force_authenticate(user=self.organization1.owner)
        grant = GrantFactory()
        self.organization1.grants.add(grant)
        self.organization1.save()

        url = reverse("organizations-grants-detail", args=[self.organization1.id, grant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)

    def test_delete_fails_if_not_organization_owner(self):
        self.client.force_authenticate(user=self.organization2.owner)

        url = reverse("organizations-grants-detail", args=[self.organization1.id, self.grant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)

    def test_delete_fails_if_unauthenticated(self):
        self.client.force_authenticate(user=None)

        url = reverse("organizations-grants-detail", args=[self.organization1.id, self.grant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)

    def test_cannot_put_a_relationship(self):
        self.client.force_authenticate(user=self.organization1.owner)
        grant = GrantFactory()
        url = reverse("organizations-grants-detail", args=[self.organization1.id, grant.id])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 405)
