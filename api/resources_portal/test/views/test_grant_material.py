from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Material
from resources_portal.test.factories import GrantFactory, MaterialFactory, UserFactory

fake = Faker()


class GrantMaterialsTestCase(APITestCase):
    """
    Tests /grants/<id>/materials operations.
    """

    def setUp(self):
        self.grant = GrantFactory()
        self.url = reverse("grant-detail", args=[self.grant.id])

    def test_get_single_material_not_allowed(self):
        self.client.force_authenticate(user=self.grant.user)
        material = self.grant.materials.first()
        url = reverse("grants-material-detail", args=[self.grant.id, material.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)

    def test_get_request_returns_materials(self):
        self.client.force_authenticate(user=self.grant.user)
        url = reverse("grants-material-list", args=[self.grant.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_fails_if_not_allowed(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)
        url = reverse("grants-material-list", args=[self.grant.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_post_grant_owner_associates_a_material(self):
        user = self.grant.user
        organization = self.grant.organizations.first()

        # Organization's owner is a new user by default.
        organization.owner = user
        organization.save()

        self.client.force_authenticate(user=user)

        material = MaterialFactory(contact_user=user, organization=organization)
        url = reverse("grants-material-list", args=[self.grant.id])
        response = self.client.post(url, data=model_to_dict(material))

        self.assertEqual(response.status_code, 201)
        self.assertIn(material, self.grant.materials.all())

    def test_post_org_member_associates_a_material(self):
        organization = self.grant.organizations.first()
        self.client.force_authenticate(user=organization.owner)

        # Organization's owner is a new user by default.
        material = MaterialFactory(contact_user=organization.owner, organization=organization)
        url = reverse("grants-material-list", args=[self.grant.id])
        response = self.client.post(url, data=model_to_dict(material))

        self.assertEqual(response.status_code, 201)

    def test_post_fails_if_user_not_in_org(self):
        # This is the grant's user, but the user isn't actually in the org.
        user = self.grant.user
        organization = self.grant.organizations.first()

        self.client.force_authenticate(user=user)

        material = MaterialFactory(contact_user=user, organization=organization)
        url = reverse("grants-material-list", args=[self.grant.id])
        response = self.client.post(url, data=model_to_dict(material))

        self.assertEqual(response.status_code, 403)

    def test_post_fails_if_grant_not_associated(self):
        user = self.grant.user
        self.client.force_authenticate(user=user)

        # Organization's owner is a new user by default.
        material = MaterialFactory(contact_user=user)
        # user owns material's organization, his grant just isn't associated with that org.
        material.organization.owner = user
        url = reverse("grants-material-list", args=[self.grant.id])
        response = self.client.post(url, data=model_to_dict(material))

        self.assertEqual(response.status_code, 403)

    def test_delete_owner_disassociates_a_material(self):
        self.client.force_authenticate(user=self.grant.user)
        material = self.grant.materials.first()
        url = reverse("grants-material-detail", args=[self.grant.id, material.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)

        self.grant.refresh_from_db()
        self.assertNotIn(material, self.grant.materials.all())
        # Verify that the material was not deleted, just its relationship
        Material.objects.get(pk=material.id)

    def test_delete_org_member_disassociates_a_material(self):
        material = self.grant.materials.first()
        material.organization.grants.add(self.grant)
        self.client.force_authenticate(user=material.organization.members.first())
        url = reverse("grants-material-detail", args=[self.grant.id, material.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)

        self.grant.refresh_from_db()
        self.assertNotIn(material, self.grant.materials.all())
        # Verify that the material was not deleted, just its relationship
        Material.objects.get(pk=material.id)

    def test_delete_fails_if_not_grant_owner(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)

        material = self.grant.materials.first()
        url = reverse("grants-material-detail", args=[self.grant.id, material.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)

    def test_cannot_put_a_relationship(self):
        self.client.force_authenticate(user=self.grant.user)
        material = MaterialFactory()
        url = reverse("grants-material-detail", args=[self.grant.id, material.id])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 405)
