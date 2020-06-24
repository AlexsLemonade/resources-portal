from unittest.mock import patch

from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import User
from resources_portal.test.factories import GrantFactory, MaterialFactory
from resources_portal.test.mocks import (
    AUTHORIZATION_DICT,
    MOCK_EMAIL,
    generate_mock_authorization_response,
    generate_mock_orcid_record_response,
    get_mock_url,
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
    @patch("requests.post", side_effect=generate_mock_authorization_response)
    def test_oauth_flow_creates_new_user(self, mock_auth_request, mock_record_request):

        response = self.client.get(get_mock_url([self.grant1, self.grant2]))

        user = User.objects.get(pk=self.client.session["_auth_user_id"])

        material = MaterialFactory(contact_user=user, organization=self.user.organizations.first())
        material_data = model_to_dict(material)

        response = self.client.post(reverse("material-list"), material_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(user.orcid, AUTHORIZATION_DICT["orcid"])

        self.assertEqual(user.email, MOCK_EMAIL)

        self.assertTrue(self.grant1 in user.grants.all())
        self.assertTrue(self.grant2 in user.grants.all())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
