from django.contrib.auth.hashers import check_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

import factory
from faker import Faker

from resources_portal.models import Organization, User
from resources_portal.test.factories import UserFactory

fake = Faker()


class TestUserListTestCase(APITestCase):
    """
    Tests /users list operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.superuser = User.objects.create_superuser("new_user", "newemail@test.com", "password")
        self.url = reverse("user-list")
        self.user_data = factory.build(dict, FACTORY_CLASS=UserFactory)
        # Don't post created_at and updated_at.
        self.user_data.pop("created_at")
        self.user_data.pop("updated_at")

    def test_list_request_from_admin_succeeds(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_request_from_non_admin_forbidden(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_request_with_no_data_fails(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        response = self.client.post(self.url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(pk=response.data.get("id"))
        self.assertEqual(user.username, self.user_data.get("username"))
        self.assertTrue(check_password(self.user_data.get("password"), user.password))

        self.assertIsNotNone(Organization.objects.get(owner=user))


class TestUserDetailTestCase(APITestCase):
    """
    Tests /users detail operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.second_user = UserFactory()
        self.superuser = User.objects.create_superuser("new_user", "newemail@test.com", "password")
        self.url = reverse("user-detail", kwargs={"pk": self.user.pk})
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.user.auth_token}")

    def test_get_request_returns_a_given_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_from_wrong_user_forbidden(self):
        self.client.force_authenticate(user=self.second_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_request_from_unauthenticated_user_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_request_from_admin_succeeds(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_a_user(self):
        self.client.force_authenticate(user=self.user)
        new_first_name = fake.first_name()
        payload = {"first_name": new_first_name}
        response = self.client.put(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user = User.objects.get(pk=self.user.id)
        self.assertEqual(user.first_name, new_first_name)

    def test_put_request_from_wrong_user_forbidden(self):
        self.client.force_authenticate(user=self.second_user)
        new_first_name = fake.first_name()
        payload = {"first_name": new_first_name}
        response = self.client.put(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        new_first_name = fake.first_name()
        payload = {"first_name": new_first_name}
        response = self.client.put(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_admin_succeeds(self):
        self.client.force_authenticate(user=self.superuser)
        new_first_name = fake.first_name()
        payload = {"first_name": new_first_name}
        response = self.client.put(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_request_from_admin_succeeds(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_request_from_non_admin_forbidden(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
