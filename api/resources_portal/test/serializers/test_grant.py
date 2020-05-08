from django.forms.models import model_to_dict
from django.test import TestCase

from resources_portal.test.factories import GrantFactory
from resources_portal.views.grant import GrantDetailSerializer


class TestGrantSerializer(TestCase):
    def setUp(self):
        grant = GrantFactory()
        self.grant_data = model_to_dict(grant)

    def test_serializer_with_empty_data(self):
        serializer = GrantDetailSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = GrantDetailSerializer(data=self.grant_data)
        self.assertTrue(serializer.is_valid())
