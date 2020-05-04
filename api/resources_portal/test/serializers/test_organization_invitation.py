from django.core.exceptions import PermissionDenied
from django.forms.models import model_to_dict
from django.test import TestCase

from guardian.shortcuts import assign_perm, remove_perm

from resources_portal.test.factories import OrganizationInvitationFactory
from resources_portal.views.organization_invitations import OrganizationInvitationSerializer


class TestOrganizationInvitationSerializer(TestCase):
    def setUp(self):
        self.invitation = OrganizationInvitationFactory()
        self.invitation_data = model_to_dict(self.invitation)
        reference_fields = ("requester", "organization", "request_reciever")

        for field in reference_fields:
            self.invitation_data[field] = str(self.invitation_data[field])

    def test_serializer_with_empty_data(self):
        serializer = OrganizationInvitationSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_serializer_with_valid_data(self):
        serializer = OrganizationInvitationSerializer(data=self.invitation_data)
        serializer.is_valid()
        self.assertTrue(serializer.is_valid())
