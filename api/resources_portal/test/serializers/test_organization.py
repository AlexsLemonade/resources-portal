from django.forms.models import model_to_dict
from django.test import TestCase

from resources_portal.test.factories import OrganizationFactory
from resources_portal.views.organization import OrganizationSerializer


class TestOrganizationSerializer(TestCase):
    def setUp(self):
        self.organization_data = model_to_dict(OrganizationFactory())

    def test_serializer_with_empty_data(self):
        serializer = OrganizationSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = OrganizationSerializer(data=self.organization_data)
        self.assertTrue(serializer.is_valid())
