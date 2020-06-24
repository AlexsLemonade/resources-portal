from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import User
from resources_portal.test.factories import GrantFactory
from resources_portal.test.mocks import (
    MOCK_EMAIL,
    ORCID_AUTHORIZATION_DICT,
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
    get_mock_oauth_url,
)


class TestOAuthUserCreation(APITestCase):
    """
    Tests OAuth's ability to create users.
    """

    def setUp(self):
        self.grant1 = GrantFactory()
        self.grant2 = GrantFactory()

        self.url = get_mock_oauth_url([self.grant1, self.grant2])

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_orcid_authorization_response)
    def test_oauth_flow_creates_new_user(self, mock_auth_request, mock_record_request):
        response = self.client.get(self.url)

        user = User.objects.get(pk=self.client.session["_auth_user_id"])

        self.assertEqual(user.orcid, ORCID_AUTHORIZATION_DICT["orcid"])

        self.assertEqual(user.email, MOCK_EMAIL)

        self.assertTrue(self.grant1 in user.grants.all())
        self.assertTrue(self.grant2 in user.grants.all())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
