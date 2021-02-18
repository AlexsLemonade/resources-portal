from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import Material
from resources_portal.test.factories import GrantFactory, OrganizationFactory, UserFactory


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

    def test_import_succeeds_with_GSE_URL(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "import_source": "GEO",
                "accession_code": "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE24542",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "GSE24542")
        self.assertEqual(
            material.additional_metadata["number_of_samples"], 2,
        )

    def test_import_succeeds_with_GSM_URL(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "import_source": "GEO",
                "accession_code": "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM609241",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "GSE24542")
        self.assertEqual(
            material.additional_metadata["number_of_samples"], 2,
        )

    def test_import_succeeds_with_GSM_accession(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url, {"import_source": "GEO", "accession_code": "GSM609241"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "GSE24542")
        self.assertEqual(
            material.additional_metadata["number_of_samples"], 2,
        )
