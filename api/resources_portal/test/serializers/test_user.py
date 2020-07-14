from django.forms.models import model_to_dict
from django.test import TestCase

import factory

from resources_portal.test.factories import UserFactory
from resources_portal.views.user import UserSerializer


class TestCreateUserSerializer(TestCase):
    def setUp(self):
        self.user_data = factory.build(dict, FACTORY_CLASS=UserFactory)

    def test_serializer_with_empty_data(self):
        serializer = UserSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_hashes_password(self):
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
