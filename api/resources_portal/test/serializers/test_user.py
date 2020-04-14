from django.contrib.auth.hashers import check_password
from django.test import TestCase

import factory

from resources_portal.test.factories import UserFactory
from resources_portal.views.user import CreateUserSerializer


class TestCreateUserSerializer(TestCase):
    def setUp(self):
        self.user_data = factory.build(dict, FACTORY_CLASS=UserFactory)

    def test_serializer_with_empty_data(self):
        serializer = CreateUserSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = CreateUserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_hashes_password(self):
        serializer = CreateUserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())

        user = serializer.save()
        self.assertTrue(check_password(self.user_data.get("password"), user.password))
