from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

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

fake = Faker()


class TestORCIDCredentialsTestCase(APITestCase):
    """
    Tests /orcid-credentials operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.url = reverse("orcid-credentials")

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_login_(self, mock_auth_request, mock_record_request):
        response = self.client.post(self.url, {"code": "MOCKCODE", "origin_url": "mock.origin.com"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(response.json()["orcid"], ORCID_AUTHORIZATION_DICT["orcid"])
        self.assertEqual(response.json()["access_token"], ORCID_AUTHORIZATION_DICT["access_token"])
        self.assertEqual(
            response.json()["refresh_token"], ORCID_AUTHORIZATION_DICT["refresh_token"]
        )
