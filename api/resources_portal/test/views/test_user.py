from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import User
from resources_portal.test.factories import UserFactory

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

    def test_list_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_not_allowed(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


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

    def test_get_request_from_unauthenticated_user_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_updates_a_user(self):
        self.client.force_authenticate(user=self.user)

        new_first_name = fake.first_name()
        user_json = self.client.get(self.url).json()
        user_json["first_name"] = new_first_name

        response = self.client.put(self.url, user_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user = User.objects.get(pk=self.user.id)
        self.assertEqual(user.first_name, new_first_name)

    def test_put_request_from_wrong_user_forbidden(self):
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
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

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
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_only_soft_deletes_objects(self):
        self.client.force_authenticate(user=self.user)
        user_id = self.user.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.deleted_objects.filter(id=user_id).count(), 1)
