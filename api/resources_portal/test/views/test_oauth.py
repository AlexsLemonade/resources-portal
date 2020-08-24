from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import User
from resources_portal.test.factories import UserFactory
from resources_portal.test.utils import (
    MOCK_EMAIL,
    MOCK_GRANTS,
    ORCID_AUTHORIZATION_DICT,
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
    get_mock_auth_data,
)


class TestOAuthUserCreation(APITestCase):
    """
    Tests OAuth's ability to create users.
    """

    def setUp(self):
        self.url = reverse("auth")

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_oauth_flow_creates_new_user(self, mock_auth_request, mock_record_request):
        response = self.client.post(self.url, get_mock_auth_data(MOCK_GRANTS))

        user = User.objects.get(pk=response.json()["user_id"])

        self.assertEqual(user.orcid, ORCID_AUTHORIZATION_DICT["orcid"])

        self.assertEqual(user.email, MOCK_EMAIL)

        self.assertEqual(len(user.grants.all()), 2)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_oauth_flow_logs_in_existing_user(self, mock_auth_request, mock_record_request):
        existing_user = UserFactory(orcid=ORCID_AUTHORIZATION_DICT["orcid"])

        response = self.client.post(self.url, get_mock_auth_data(MOCK_GRANTS))

        logged_in_user = User.objects.get(pk=response.json()["user_id"])

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(existing_user, logged_in_user)
