from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import User
from resources_portal.test.factories import AddressFactory, UserFactory
from resources_portal.test.utils import (
    MOCK_EMAIL,
    MOCK_GRANTS,
    ORCID_AUTHORIZATION_DICT,
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
)
from resources_portal.views.user import PRIVATE_FIELDS

fake = Faker()


class TestUserListTestCase(APITestCase):
    """
    Tests /users list operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.url = reverse("user-list")

    def test_list_request_succeeds(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestUserPostTestCase(APITestCase):
    """
    Tests /users POST requests.
    """

    def setUp(self):
        self.user = UserFactory()
        self.url = reverse("user-list")
        self.user_data = {
            "orcid": "000000-111111-222222",
            "access_token": "12345",
            "refresh_token": "56789",
            "email": MOCK_EMAIL,
            "grants": MOCK_GRANTS,
        }

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_post_creates_new_user_through_oauth(self, mock_auth_request, mock_record_request):
        response = self.client.post(self.url, self.user_data)

        user = User.objects.get(pk=response.json()["user_id"])

        self.assertEqual(user.orcid, ORCID_AUTHORIZATION_DICT["orcid"])

        self.assertEqual(user.email, MOCK_EMAIL)

        self.assertEqual(len(user.grants.all()), 2)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(user.personal_organization.name, "My Resources")

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_post_with_invalid_grants_returns_error(self, mock_auth_request, mock_record_request):
        self.user_data["grants"][0].pop("funder_id")

        response = self.client.post(self.url, self.user_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_post_with_existing_orcid_returns_error(self, mock_auth_request, mock_record_request):
        self.user_data["orcid"] = self.user.orcid

        response = self.client.post(self.url, self.user_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestUserDetailTestCase(APITestCase):
    """
    Tests /users detail operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.second_user = UserFactory()

        self.superuser = UserFactory()
        self.superuser.is_superuser = True
        self.superuser.save()

        self.url = reverse("user-detail", kwargs={"pk": self.user.pk})
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.user.auth_token}")

    def test_get_request_returns_a_given_user(self):
        self.client.force_authenticate(user=self.second_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_json = response.json()
        for field in PRIVATE_FIELDS:
            self.assertNotIn(field, response_json)

    def test_get_self_returns_private_fields(self):
        self.client.force_authenticate(user=self.user)

        # Test that addresses are filtered.
        self.user.addresses.add(AddressFactory())
        self.user.addresses.add(AddressFactory(saved_for_reuse=False))

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_json = response.json()
        for field in PRIVATE_FIELDS:
            self.assertIn(field, response_json)

        self.assertEqual(len(response_json["addresses"]), 2)

    def test_get_request_from_unauthenticated_user_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_request_updates_a_user(self):
        self.client.force_authenticate(user=self.user)

        new_first_name = fake.first_name()
        user_json = self.client.get(self.url).json()
        user_json["first_name"] = new_first_name

        response = self.client.put(self.url, user_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user = User.objects.get(pk=self.user.id)
        self.assertEqual(user.first_name, new_first_name)

    def test_put_request_from_wrong_user_fails(self):
        self.client.force_authenticate(user=self.second_user)

        new_first_name = fake.first_name()
        user_json = self.client.get(self.url).json()
        user_json["first_name"] = new_first_name

        response = self.client.put(self.url, user_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)

        new_first_name = fake.first_name()
        user_json = self.client.get(self.url).json()
        user_json["first_name"] = new_first_name

        response = self.client.put(self.url, user_json)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_request_from_admin_succeeds(self):
        self.client.force_authenticate(user=self.superuser)

        new_first_name = fake.first_name()
        user_json = self.client.get(self.url).json()
        user_json["first_name"] = new_first_name

        response = self.client.put(self.url, user_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_request_succeeds(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_cannot_delete_another_user(self):
        self.client.force_authenticate(user=self.second_user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_request_only_soft_deletes_objects(self):
        self.client.force_authenticate(user=self.user)
        user_id = self.user.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.deleted_objects.filter(id=user_id).count(), 1)
