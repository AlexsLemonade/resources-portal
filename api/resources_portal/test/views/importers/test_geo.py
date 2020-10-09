from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import Material
from resources_portal.test.factories import (
    GrantFactory,
    MaterialFactory,
    OrganizationFactory,
    UserFactory,
)
from resources_portal.test.utils import get_mock_dataset_data


class ImportGEOTestCase(APITestCase):
    """
    Tests importing via GEO.
    """

    def setUp(self):
        self.test_accession_with_pubmed_id = "GSE24528"
        self.test_accession_with_pubmed_id_num_samples = 15
        self.test_accession_without_pubmed_id = "GSE44094"
        self.test_accession_without_pubmed_id_num_samples = 3

        self.org = OrganizationFactory()
        self.user = UserFactory()
        self.grant = GrantFactory(user=self.user)

        self.org.members.add(self.user)
        self.org.save()
        self.url = reverse("materials-import")
        self.create_url = reverse("material-list")

    def test_import_succeeds_for_study_with_pubmed_id(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {"import_source": "GEO", "accession_code": self.test_accession_with_pubmed_id,},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(
            material.additional_metadata["accession_code"], self.test_accession_with_pubmed_id
        )
        self.assertEqual(
            material.additional_metadata["number_of_samples"],
            self.test_accession_with_pubmed_id_num_samples,
        )

    def test_import_succeeds_for_study_without_pubmed_id(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("materials-import")
        response = self.client.post(
            url, {"import_source": "GEO", "accession_code": self.test_accession_without_pubmed_id,},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(
            material.additional_metadata["accession_code"], self.test_accession_without_pubmed_id
        )
        self.assertEqual(
            material.additional_metadata["number_of_samples"],
            self.test_accession_without_pubmed_id_num_samples,
        )

    @patch("resources_portal.importers.geo.gather_all_metadata", side_effect=get_mock_dataset_data)
    def test_import_previously_imported_geo_fails(self, mock_dataset):
        self.client.force_authenticate(user=self.user)
        accession_code = "12345"
        response = self.client.post(
            self.url, {"import_source": "GEO", "accession_code": accession_code}
        )

        MaterialFactory(
            imported=True,
            import_source="GEO",
            additional_metadata={
                "accession_code": response.json()["additional_metadata"]["accession_code"]
            },
        )

        # Try to import the same material again
        response = self.client.post(
            self.url, {"import_source": "GEO", "accession_code": accession_code}
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error_code"], "ALREADY_IMPORTED")

    def test_import_from_unauthenticated_fails(self):
        url = reverse("materials-import")
        response = self.client.post(
            url,
            {
                "import_source": "GEO",
                "accession_code": self.test_accession_with_pubmed_id,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
