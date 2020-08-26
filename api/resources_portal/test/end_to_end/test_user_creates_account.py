from unittest.mock import patch

from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import User
from resources_portal.test.factories import MaterialFactory
from resources_portal.test.utils import (
    MOCK_EMAIL,
    MOCK_GRANTS,
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
)


class TestUserCreatesAccount(APITestCase):
    """
    Tests user account creation and resource generation.
    The flow of the test is as follows:

    1. Create account and supply grant id to be used with personal organization.
    2. List resource on personal organization.
    """

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_create_account_and_list_resource(self, mock_auth_request, mock_record_request):
        user_data = {
            "email": MOCK_EMAIL,
            "grant_info": MOCK_GRANTS,
        }

        # Create user with ORCID
        response = self.client.post(
            reverse("orcid-credentials"), {"code": "MOCKCODE", "origin_url": "mock.origin.com"}
        )

        user_data["orcid"] = response.json()["orcid"]
        user_data["access_token"] = response.json()["access_token"]
        user_data["refresh_token"] = response.json()["refresh_token"]

        response = self.client.post(reverse("user-list"), user_data)

        # Get user, sign in
        user = User.objects.get(pk=response.json()["user_id"])
        self.client.force_authenticate(user=user)

        # Create resource on personal organization
        material = MaterialFactory(contact_user=user, organization=user.personal_organization)
        material_data = model_to_dict(material)

        response = self.client.post(reverse("material-list"), material_data, format="json")

        # Resource assertions
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(material.contact_user.id, response.data["contact_user"])
        self.assertEqual(material.organization.id, response.data["organization"])

        # User assertions
        self.assertEqual(user.email, MOCK_EMAIL)
        self.assertEqual(len(user.grants.all()), 2)
