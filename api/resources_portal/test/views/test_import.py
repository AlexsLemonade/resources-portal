from unittest.mock import patch

from django.urls import reverse
from rest_framework.test import APITestCase

from resources_portal.test.factories import MaterialFactory, UserFactory

MOCK_DATASET_DATA = {
    "description": "Array of tea sandwiches",
    "platform": "Amazon Tabletop",
    "technology": "Toaster",
    "title": "Data on tea sandwiches",
    "url": "www.teasandwiches.com",
    "number_of_samples": "3",
    "organism_names": ["Mus Musculus"],
}

MOCK_PROTOCOL_DATA = {
    "protocol_name": "How to cook a perfect risotto",
    "description": "Gordon Ramsey teaches you how to make a perfect risotto",
    "url": "www.gordonramseyrisotto.com",
}


def get_mock_dataset_data(*args, **kwargs):
    return MOCK_DATASET_DATA


def get_mock_protocol_data(*args, **kwargs):
    return MOCK_PROTOCOL_DATA


class ImportTestCase(APITestCase):
    """
    Tests /import operations.
    """

    def setUp(self):
        self.url = reverse("materials-import")
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_import_from_unauthorized_fails(self):
        self.client.force_authenticate(user=None)
        accession_code = "12345"
        response = self.client.post(
            self.url, {"import_source": "SRA", "accession_code": accession_code}
        )

        self.assertEqual(response.status_code, 401)

    @patch("resources_portal.importers.sra.gather_all_metadata", side_effect=get_mock_dataset_data)
    def test_import_sra(self, mock_dataset):
        accession_code = "12345"
        response = self.client.post(
            self.url, {"import_source": "SRA", "accession_code": accession_code}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["additional_metadata"]["accession_code"], accession_code)

    @patch("resources_portal.importers.sra.gather_all_metadata", side_effect=get_mock_dataset_data)
    def test_import_previously_imported_sra_fails(self, mock_dataset):
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

    @patch("resources_portal.importers.geo.gather_all_metadata", side_effect=get_mock_dataset_data)
    def test_import_geo(self, mock_dataset):
        accession_code = "12345"
        response = self.client.post(
            self.url, {"import_source": "GEO", "accession_code": accession_code}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["additional_metadata"]["accession_code"], accession_code)

    @patch("resources_portal.importers.geo.gather_all_metadata", side_effect=get_mock_dataset_data)
    def test_import_previously_imported_geo_fails(self, mock_dataset):
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

    @patch(
        "resources_portal.importers.protocols_io.gather_all_metadata",
        side_effect=get_mock_protocol_data,
    )
    def test_import_protocol(self, mock_protocol):
        protocol_doi = "12345"
        response = self.client.post(
            self.url, {"import_source": "PROTOCOLS_IO", "protocol_doi": protocol_doi}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["additional_metadata"]["protocol_doi"], protocol_doi)

    @patch(
        "resources_portal.importers.protocols_io.gather_all_metadata",
        side_effect=get_mock_protocol_data,
    )
    def test_import_previously_imported_protocol_fails(self, mock_protocol):
        protocol_doi = "12345"
        response = self.client.post(
            self.url, {"import_source": "PROTOCOLS_IO", "protocol_doi": protocol_doi}
        )
        MaterialFactory(
            imported=True,
            import_source="PROTOCOLS_IO",
            additional_metadata={
                "protocol_doi": response.json()["additional_metadata"]["protocol_doi"]
            },
        )

        # Try to import the same material again
        response = self.client.post(
            self.url, {"import_source": "PROTOCOLS_IO", "protocol_doi": protocol_doi}
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error_code"], "ALREADY_IMPORTED")
