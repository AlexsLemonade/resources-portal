from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import Material
from resources_portal.test.factories import OrganizationFactory, UserFactory


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

    def test_import_from_unauthenticated_fails(self):
        response = self.client.post(
            self.url,
            {"import_source": "SRA", "accession_code": self.test_accession_with_pubmed_id,},
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_import_succeeds_with_SRP_URL(self):

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "import_source": "SRA",
                "accession_code": "https://www.ebi.ac.uk/ena/browser/view/SRP000598",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "SRP000598")
        self.assertEqual(material.additional_metadata["number_of_samples"], 2)

    def test_import_succeeds_with_PRJNA_accession(self):

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url, {"import_source": "SRA", "accession_code": "PRJNA168994"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "SRP000598")
        self.assertEqual(material.additional_metadata["number_of_samples"], 2)

    def test_import_succeeds_with_PRJNA_URL(self):

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "import_source": "SRA",
                "accession_code": "https://www.ebi.ac.uk/ena/browser/view/PRJNA168994",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "SRP000598")
        self.assertEqual(material.additional_metadata["number_of_samples"], 2)

    def test_import_succeeds_with_SRR_URL(self):

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "import_source": "SRA",
                "accession_code": "https://www.ebi.ac.uk/ena/browser/view/SRR013547",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "SRP000598")
        self.assertEqual(material.additional_metadata["number_of_samples"], 2)

    def test_import_succeeds_with_SRR_accession(self):

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url, {"import_source": "SRA", "accession_code": "SRR013547"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "SRP000598")
        self.assertEqual(material.additional_metadata["number_of_samples"], 2)

    def test_import_succeeds_with_SRP_ncbi_URL(self):

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "import_source": "SRA",
                "accession_code": "https://trace.ncbi.nlm.nih.gov/Traces/sra/?study=SRP003819",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "SRP003819")
        self.assertEqual(material.additional_metadata["number_of_samples"], 2)

    def test_import_succeeds_with_SRR_ncbi_URL(self):

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "import_source": "SRA",
                "accession_code": "https://trace.ncbi.nlm.nih.gov/Traces/sra/?run=SRR013547",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_json = response.json()
        material_json["organization"] = self.org.id

        response = self.client.post(self.create_url, material_json)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.additional_metadata["accession_code"], "SRP000598")
        self.assertEqual(material.additional_metadata["number_of_samples"], 2)
