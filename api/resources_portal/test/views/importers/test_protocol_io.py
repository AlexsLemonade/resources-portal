from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import Material
from resources_portal.test.factories import GrantFactory, OrganizationFactory, UserFactory


class ImportProtocolTestCase(APITestCase):
    """
    Tests importing via protocols.io.
    """

    def setUp(self):
        self.url = reverse("materials-import")
        self.create_url = reverse("material-list")

        self.test_protocol_doi = "dx.doi.org/10.17504/protocols.io.c4gytv"
        self.test_protocol_name = "Lysis Buffer (20 mL)"
        self.test_protocol_abstract = (
            "Must be made fresh before experiment because of the Sucrose. For 20 mL solutions."
        )

        self.invalid_protocol_doi = "dx.doi.org/10.17504/protocols.io.pikachu"

        self.org = OrganizationFactory()
        self.grant = GrantFactory()
        self.user = UserFactory()

        self.user.grants.add(self.grant)
        self.user.save()

        self.org.members.add(self.user)
        self.org.save()

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

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.grants.first(), self.grant)
        self.assertEqual(material.additional_metadata["protocol_name"], self.test_protocol_name)
        self.assertEqual(material.additional_metadata["abstract"], self.test_protocol_abstract)

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
                "study_accession": self.test_protocol_doi,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
