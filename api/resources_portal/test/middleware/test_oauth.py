import json
from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

import requests

from resources_portal.models import User
from resources_portal.test.factories import GrantFactory

MOCK_AUTHORIZATION_CODE = "mock"
MOCK_EMAIL = "test@mock.com"

AUTHORIZATION_DICT = {
    "name": "Elong Musket",
    "orcid": "1234-Iwan-naGo-t0maRs",
    "access_token": "CyBe-RTru-KIn-SpAce",
    "refresh_token": "Pl3A-SeBuY-mYSt0-kS",
}

SUMMARY_DICT = {"name": {"given-names": {"value": "Elong"}, "family-name": {"value": "Musket"}}}


class MockAuthorizationResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data


class MockRecordResponse:
    def __init__(self, summary):
        self.summary = summary

    def read_record_public(self, client_id, client_secret, sandbox):
        return self.summary


# This method will be used by the mock to replace requests.get
def generate_mock_authorization_response(*args, **kwargs):
    return MockAuthorizationResponse(AUTHORIZATION_DICT, 200)


def generate_mock_orcid_record_response(*args, **kwargs):
    return MockRecordResponse(SUMMARY_DICT)


class TestOAuthUserCreation(APITestCase):
    """
    Tests OAuth's ability to create users.
    """

    def setUp(self):
        self.grant1 = GrantFactory()
        self.grant2 = GrantFactory()

        self.grant_ids = [self.grant1.id, self.grant2.id]

        base_url = reverse("user-list")
        self.url = (
            f"{base_url}"
            f"?code={MOCK_AUTHORIZATION_CODE}"
            f"&email={MOCK_EMAIL}"
            f"&grant_id={self.grant_ids[0]}"
            f"&grant_id={self.grant_ids[1]}"
        )

    @patch("orcid.PublicAPI", side_effect=generate_mock_orcid_record_response)
    @patch("requests.post", side_effect=generate_mock_authorization_response)
    def test_oauth_flow_creates_new_user(self, mock_auth_request, mock_record_request):
        response = self.client.get(self.url)

        user = User.objects.get(pk=self.client.session["_auth_user_id"])

        self.assertEqual(user.orcid, AUTHORIZATION_DICT["orcid"])

        self.assertEqual(user.email, MOCK_EMAIL)

        self.assertTrue(self.grant1 in user.grants.all())
        self.assertTrue(self.grant2 in user.grants.all())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
