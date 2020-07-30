from django.forms.models import model_to_dict
from django.test import TestCase

from resources_portal.test.factories import AddressFactory
from resources_portal.views.address import AddressSerializer


class TestAddressSerializer(TestCase):
    def setUp(self):
        self.address_data = model_to_dict(AddressFactory())

    def test_serializer_with_empty_data(self):
        serializer = AddressSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = AddressSerializer(data=self.address_data)
        self.assertTrue(serializer.is_valid())
