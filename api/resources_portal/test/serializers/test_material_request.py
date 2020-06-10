from django.forms.models import model_to_dict
from django.test import TestCase

from resources_portal.test.factories import MaterialRequestFactory
from resources_portal.views.material_request import MaterialRequestSerializer


class TestMaterialRequestSerializer(TestCase):
    def setUp(self):
        self.material_request_data = model_to_dict(MaterialRequestFactory())

    def test_serializer_with_empty_data(self):
        serializer = MaterialRequestSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = MaterialRequestSerializer(data=self.material_request_data)
        self.assertTrue(serializer.is_valid())
