from django.forms.models import model_to_dict
from django.test import TestCase

from resources_portal.test.factories import MaterialFactory
from resources_portal.views.material import MaterialSerializer


class TestMaterialSerializer(TestCase):
    def setUp(self):
        self.material_data = model_to_dict(MaterialFactory())

    def test_serializer_with_empty_data(self):
        serializer = MaterialSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = MaterialSerializer(data=self.material_data)
        self.assertTrue(serializer.is_valid())
