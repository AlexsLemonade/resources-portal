from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import Material
from resources_portal.test.factories import MaterialFactory, OrganizationFactory, UserFactory
from resources_portal.test.utils import get_mock_dataset_data


class ImportSRATestCase(APITestCase):
    """
    Tests importing via SRA.
    """

    def setUp(self):
        self.test_accession_with_pubmed_id = "SRP107324"
        self.test_accession_with_pubmed_id_num_samples = 9
        self.test_accession_without_pubmed_id = "SRP009841"
        self.test_accession_without_pubmed_id_num_samples = 6

        self.org = OrganizationFactory()
        self.user = UserFactory()

        self.org.members.add(self.user)
        self.org.save()
        self.url = reverse("materials-import")
        self.create_url = reverse("material-list")

    def test_import_succeeds_for_study_with_pubmed_id(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {"import_source": "SRA", "accession_code": self.test_accession_with_pubmed_id,},
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

        response = self.client.post(
            self.url,
            {"import_source": "SRA", "accession_code": self.test_accession_without_pubmed_id,},
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

    @patch("resources_portal.importers.sra.gather_all_metadata", side_effect=get_mock_dataset_data)
    def test_import_previously_imported_sra_fails(self, mock_dataset):
        self.client.force_authenticate(user=self.user)
        accession_code = "12345"
        response = self.client.post(
            self.url, {"import_source": "SRA", "accession_code": accession_code}
        )
        MaterialFactory(
            imported=True,
            import_source="SRA",
            additional_metadata={
                "accession_code": response.json()["additional_metadata"]["accession_code"]
            },
        )

        # Try to import the same material again
        response = self.client.post(
            self.url, {"import_source": "SRA", "accession_code": accession_code}
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error_code"], "ALREADY_IMPORTED")

    def test_import_from_unauthenticated_fails(self):
        response = self.client.post(
            self.url,
            {"import_source": "SRA", "accession_code": self.test_accession_with_pubmed_id,},
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
