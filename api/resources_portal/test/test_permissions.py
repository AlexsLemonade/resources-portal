from django.test import TestCase

from .factories import OrganizationFactory, UserFactory


class TestUserPermission(TestCase):
    def test_serializer_with_empty_data(self):
        user = UserFactory.create()
        organization = OrganizationFactory.create()

        # random users can't approve requests within the organization
        self.assertFalse(user.has_perm("approve_requests", organization))

        # now check that the organization's owner can approve requests
        self.assertTrue(organization.owner.has_perm("approve_requests", organization))
