from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Grant, User
from resources_portal.test.factories import GrantFactory, PersonalOrganizationFactory, UserFactory
from resources_portal.views.grant import BAD_DISASSOCIATION_ERROR

fake = Faker()


class TestGrantPostTestCase(APITestCase):
    """
    Tests /grants list operations.
    """

    def setUp(self):
        self.url = reverse("grant-list")
        self.grant = GrantFactory()
        self.user = self.grant.user
        self.user.personal_organization = PersonalOrganizationFactory(owner=self.user)
        self.user.personal_organization.grants.set([self.grant])

    def test_list_request_non_admin_fails(self):
        self.client.force_authenticate(user=self.grant.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_request_admin_succeeds(self):
        admin = UserFactory(is_staff=True)
        self.client.force_authenticate(user=admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_request_with_no_data_fails(self):
        self.client.force_authenticate(user=self.grant.user)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        self.client.force_authenticate(user=self.user)

        get_url = reverse("grant-detail", args=[self.grant.id])
        grant_json = self.client.get(get_url).json()
        grant_json.pop("id")

        response = self.client.post(self.url, grant_json, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        grant = Grant.objects.get(id=response.json()["id"])
        self.assertIn(grant, self.user.personal_organization.grants.all())


class TestSingleGrantTestCase(APITestCase):
    """
    Tests /grants detail operations.
    """

    def setUp(self):
        self.grant = GrantFactory()
        self.user = self.grant.user
        self.user.personal_organization = PersonalOrganizationFactory(owner=self.user)
        self.user.personal_organization.grants.set([self.grant])
        self.url = reverse("grant-detail", args=[self.grant.id])

    def test_get_request_returns_a_given_grant(self):
        self.client.force_authenticate(user=self.grant.user)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_grant_requires_auth(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_get_someone_elses_grant(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_updates_a_grant(self):
        self.client.force_authenticate(user=self.grant.user)
        grant_json = self.client.get(self.url).json()

        new_title = "New Title"
        new_funder_id = "YYY-YYY-YYY"
        grant_json["title"] = new_title
        grant_json["funder_id"] = new_funder_id

        new_member = UserFactory()
        new_member.personal_organization = PersonalOrganizationFactory(owner=new_member)
        grant_json["user"] = new_member.id

        response = self.client.put(self.url, grant_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.grant.refresh_from_db()
        self.assertEqual(new_title, self.grant.title)
        self.assertEqual(new_funder_id, self.grant.funder_id)

        new_member = User.objects.get(id=new_member.id)
        self.assertEqual(new_member, self.grant.user)

        # Make sure the grant got moved from the one personal organization to the other.
        self.assertNotIn(self.grant, self.user.personal_organization.grants.all())
        self.assertIn(self.grant, new_member.personal_organization.grants.all())

    def test_cannot_update_someone_elses_grant(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)
        grant_json = self.client.get(self.url).json()

        grant_json["title"] = "New Title"
        response = self.client.put(self.url, grant_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_disassociate_fails_if_last_grant(self):
        self.client.force_authenticate(user=self.user)
        grant_json = self.client.get(self.url).json()
        grant_json["user"] = None
        response = self.client.put(self.url, grant_json)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Make sure the 400 is for the right reason
        self.assertEqual(response.json()[0], BAD_DISASSOCIATION_ERROR)

    def test_update_disassociates_if_not_last_grant(self):
        # Create second grant for user so they can disassociate from one.
        GrantFactory(user=self.user)
        self.client.force_authenticate(user=self.user)
        grant_id = self.grant.id

        grant_json = self.client.get(self.url).json()
        grant_json["user"] = None
        response = self.client.put(self.url, grant_json)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(Grant.objects.get(id=grant_id).user)

        self.assertNotIn(self.grant, self.user.personal_organization.grants.all())

    def test_delete_fails(self):
        self.client.force_authenticate(user=self.grant.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
