from django.forms.models import model_to_dict
from django.test import TestCase

from resources_portal.test.factories import MaterialRequestIssueFactory
from resources_portal.views.material_request_issue import MaterialRequestIssueSerializer


class TestMaterialRequestIssueSerializer(TestCase):
    def setUp(self):
        self.material_data = model_to_dict(MaterialRequestIssueFactory())

    def test_serializer_with_empty_data(self):
        serializer = MaterialRequestIssueSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = MaterialRequestIssueSerializer(data=self.material_data)
        self.assertTrue(serializer.is_valid())
