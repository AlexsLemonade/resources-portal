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


class TestLoginTestCase(APITestCase):
    """
    Tests /login operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.url = reverse("login")

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_login_(self, mock_auth_request, mock_record_request):
        existing_user = UserFactory(orcid=ORCID_AUTHORIZATION_DICT["orcid"])

        response = self.client.post(self.url, {"code": "MOCKCODE", "origin_url": "mock.origin.com"})

        logged_in_user = User.objects.get(pk=response.json()["user_id"])

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(existing_user, logged_in_user)
