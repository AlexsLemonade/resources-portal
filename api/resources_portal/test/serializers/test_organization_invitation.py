from django.forms.models import model_to_dict
from django.test import TestCase

from resources_portal.test.factories import OrganizationInvitationFactory
from resources_portal.views.invitations import OrganizationInvitationSerializer


class TestOrganizationInvitationSerializer(TestCase):
    def setUp(self):
        self.invitation_data = model_to_dict(OrganizationInvitationFactory)

    def test_serializer_with_empty_data(self):
        serializer = OrganizationInvitationSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = OrganizationInvitationSerializer(data=self.invitation_data)
        self.assertTrue(serializer.is_valid())
