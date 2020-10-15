from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import GrantOrganizationAssociation, Material
from resources_portal.test.factories import (
    GrantFactory,
    MaterialFactory,
    OrganizationFactory,
    UserFactory,
)
from resources_portal.test.utils import get_mock_protocol_data


class ImportProtocolTestCase(APITestCase):
    """
    Tests importing via protocols.io.
    """

    def setUp(self):
        self.url = reverse("materials-import")
        self.create_url = reverse("material-list")

        self.test_protocol_doi = "dx.doi.org/10.17504/protocols.io.c4gytv"
        self.test_protocol_name = "Lysis Buffer (20 mL)"
        self.test_protocol_description = (
            "Must be made fresh before experiment because of the Sucrose. For 20 mL solutions."
        )

        self.invalid_protocol_doi = "dx.doi.org/10.17504/protocols.io.pikachu"

        self.user = UserFactory()
        self.org = OrganizationFactory(owner=self.user)

        self.org.members.add(self.user)
        self.assertTrue(self.user in self.org.members.all())

        self.grant = GrantFactory(user=self.user)
        GrantOrganizationAssociation(grant=self.grant, organization=self.org).save()

    def test_import_protocol_succeeds(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "import_source": "PROTOCOLS_IO",
                "protocol_doi": self.test_protocol_doi,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        # Set grant as will need to be done.
        self.client.post(reverse("grants-material-list", args=[self.grant.id]), {"id": material.id})

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.grants.first(), self.grant)
        self.assertEqual(material.additional_metadata["protocol_name"], self.test_protocol_name)
        self.assertEqual(
            material.additional_metadata["description"], self.test_protocol_description
        )

    def test_import_protocol_with_invalid_doi_fails(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "import_source": "PROTOCOLS_IO",
                "protocol_doi": self.invalid_protocol_doi,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_import_from_unauthenticated_fails(self):
        response = self.client.post(
            self.url,
            {
                "import_source": "PROTOCOLS_IO",
                "accession_code": self.test_protocol_doi,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
