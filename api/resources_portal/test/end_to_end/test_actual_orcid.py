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
    get_mock_auth_data,
)

AUTH_CODE = "BhqHSx"
ORIGIN_URL = "http://localhost:2000"


class TestActualORCID(APITestCase):
    def test_create_account_and_list_resource(self):
        # Create user with ORCID
        response = self.client.post(
            reverse("auth"),
            {"code": AUTH_CODE, "origin_url": ORIGIN_URL, "grant_info": MOCK_GRANTS},
        )

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
