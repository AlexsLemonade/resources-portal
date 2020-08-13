from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import User
from resources_portal.test.factories import UserFactory

fake = Faker()


class TestUserModelTestCase(APITestCase):
    """
    Tests User model operations.
    """

    def setUp(self):
        User.objects.all().delete()

    def test_username_generated_correctly(self):
        first_name = "Chuck"
        last_name = "Norris"

        for i in range(10):
            user = UserFactory(first_name=first_name, last_name=last_name)

            if i == 0:
                print("0: ", user.username)
                self.assertEqual(user.username, f"{first_name}{last_name}")
            else:
                print("1: ", user.username)
                self.assertEqual(user.username, f"{first_name}{last_name}{i}")

    def test_fullname_generated_correctly(self):
        first_name = "Chuck"
        last_name = "Norris"

        user = UserFactory(first_name=first_name, last_name=last_name)

        self.assertEqual(user.full_name, f"{first_name} {last_name}")
