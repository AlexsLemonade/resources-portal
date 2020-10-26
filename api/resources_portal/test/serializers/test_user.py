from django.forms.models import model_to_dict
from django.test import TestCase

from resources_portal.test.factories import PersonalOrganizationFactory, UserFactory
from resources_portal.views.user import UserSerializer


class TestCreateUserSerializer(TestCase):
    def setUp(self):
        # personal_organization needs to be created first because
        # UserFactory can't build without having an id of an org to
        # reference.
        personal_organization = PersonalOrganizationFactory()
        self.user_data = model_to_dict(
            UserFactory.build(personal_organization=personal_organization)
        )

    def test_serializer_with_empty_data(self):
        serializer = UserSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_hashes_password(self):
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
