from unittest.mock import patch

from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import User
from resources_portal.test.factories import GrantFactory, MaterialFactory
from resources_portal.test.utils import (
    MOCK_EMAIL,
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
    get_mock_oauth_url,
)


class TestUserCreatesAccount(APITestCase):
    """
    Tests user account creation and resource generation.
    The flow of the test is as follows:

    1. Create account and supply grant id to be used with personal organization.
    2. List resource on personal organization.
    """

    def setUp(self):
        self.grant1 = GrantFactory()
        self.grant2 = GrantFactory()

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_create_account_and_list_resource(self, mock_auth_request, mock_record_request):
        # Create user with ORCID
        self.client.get(get_mock_oauth_url([self.grant1, self.grant2]))

        # Client is now logged in as user, get user ID from session data
        user = User.objects.get(pk=self.client.session["_auth_user_id"])

        # Create resource on personal organization
        material = MaterialFactory(contact_user=user, organization=user.organizations.first())
        material_data = model_to_dict(material)

        response = self.client.post(reverse("material-list"), material_data, format="json")

        # Resource assertions
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(material.contact_user.id, response.data["contact_user"])
        self.assertEqual(material.organization.id, response.data["organization"])

        # User assertions
        self.assertEqual(user.email, MOCK_EMAIL)
        self.assertTrue(self.grant1 in user.grants.all())
        self.assertTrue(self.grant2 in user.grants.all())
