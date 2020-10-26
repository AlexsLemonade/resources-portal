from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import User

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
            user = User(first_name=first_name, last_name=last_name)
            user.save()

            if i == 0:
                self.assertEqual(user.username, f"{first_name}{last_name}")
            else:
                self.assertEqual(user.username, f"{first_name}{last_name}{i}")

    def test_fullname_generated_correctly(self):
        first_name = "Chuck"
        last_name = "Norris"

        user = User(first_name=first_name, last_name=last_name)
        user.save()

        self.assertEqual(user.full_name, f"{first_name} {last_name}")
