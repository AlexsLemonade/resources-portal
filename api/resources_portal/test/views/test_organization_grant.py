from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Grant, Notification
from resources_portal.test.factories import (
    AttachmentFactory,
    GrantFactory,
    PersonalOrganizationFactory,
    UserFactory,
)

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
        self.org_1_member = UserFactory()
        self.organization1.members.add(self.org_1_member)
        self.organization1.grants.add(self.grant2)
        self.organization1.save()

        self.grant.user = self.organization1.owner
        self.grant.save()

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
        self.client.force_authenticate(user=UserFactory())
        url = reverse("organizations-grants-list", args=[self.organization1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_get_fails_if_not_authenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse("organizations-grants-list", args=[self.organization1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

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

        self.assertEqual(
            len(Notification.objects.filter(notification_type="ORGANIZATION_NEW_GRANT")),
            self.organization1.members.count(),
        )

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

    def test_post_succeeds_if_member(self):
        grant = GrantFactory(user=self.org_1_member)
        grant_json = {"id": grant.id}

        self.client.force_authenticate(user=self.org_1_member)
        url = reverse("organizations-grants-list", args=[self.organization1.id])

        response = self.client.post(url, data=grant_json)

        self.assertEqual(response.status_code, 201)

    def test_post_fails_if_not_member(self):
        grant = GrantFactory()
        grant.user = self.organization1.owner
        grant.save()

        # sign in as org1 owner so we can get grant
        self.client.force_authenticate(user=self.organization1.owner)
        grant_url = reverse("grant-detail", args=[grant.id])
        grant_json = self.client.get(grant_url).json()

        # then sign in as owner to diff org
        self.client.force_authenticate(user=UserFactory())
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

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_request_disassociates_a_material(self):
        self.client.force_authenticate(user=self.organization1.owner)
        url = reverse("organizations-grants-detail", args=[self.organization1.id, self.grant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)

        self.grant.refresh_from_db()
        self.assertNotIn(self.grant, self.organization1.grants.all())
        # Verify that the grant was not deleted, just its relationship
        Grant.objects.get(pk=self.grant.id)

    def test_delete_request_transfers_materials(self):
        grant = self.grant2
        user = grant.user

        # Add grant2 materials to organization1, so they can be transferred out.
        materials = grant.materials.all()
        material1 = materials[0]
        material1.organization = self.organization1
        material1.mta_attachment = AttachmentFactory(
            owned_by_user=user, owned_by_org=material1.organization
        )
        material1.save()

        # Create a personal organization for grant2.user (factory
        # doesn't create by default.)
        user.personal_organization = PersonalOrganizationFactory(owner=user)
        user.save()

        self.client.force_authenticate(user)
        url = reverse("organizations-grants-detail", args=[self.organization1.id, grant.id])
        response = self.client.delete(url + "?transfer=true")
        self.assertEqual(response.status_code, 204)

        grant.refresh_from_db()
        self.assertNotIn(grant, self.organization1.grants.all())
        # Verify that the grant was not deleted, just its relationship
        grant = Grant.objects.get(pk=grant.id)

        for material in grant.materials.all():
            self.assertEqual(user.personal_organization, material.organization)
            self.assertEqual(user.personal_organization, material.mta_attachment.owned_by_org)

    def test_delete_fails_if_not_grant_owner(self):
        self.client.force_authenticate(user=UserFactory())
        grant = GrantFactory()
        self.organization1.grants.add(grant)
        self.organization1.save()

        url = reverse("organizations-grants-detail", args=[self.organization1.id, grant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)

    def test_delete_fails_if_not_organization_owner(self):
        self.client.force_authenticate(user=UserFactory())

        url = reverse("organizations-grants-detail", args=[self.organization1.id, self.grant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)

    def test_delete_fails_if_unauthenticated(self):
        self.client.force_authenticate(user=None)

        url = reverse("organizations-grants-detail", args=[self.organization1.id, self.grant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_put_a_relationship(self):
        self.client.force_authenticate(user=self.organization1.owner)
        grant = GrantFactory()
        url = reverse("organizations-grants-detail", args=[self.organization1.id, grant.id])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 405)
