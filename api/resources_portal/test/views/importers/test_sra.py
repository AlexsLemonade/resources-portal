from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.models import Material
from resources_portal.test.factories import GrantFactory, OrganizationFactory, UserFactory


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
        self.grant = GrantFactory()
        self.user = UserFactory()

        self.user.grants.add(self.grant)
        self.user.save()

        self.org.members.add(self.user)
        self.org.save()

    def test_import_succeeds_for_study_with_pubmed_id(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("materials-import")
        response = self.client.post(
            url,
            {
                "import_type": "SRA",
                "study_accession": self.test_accession_with_pubmed_id,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.grants.first(), self.grant)
        self.assertEqual(
            material.additional_metadata["study_id"], self.test_accession_with_pubmed_id
        )
        self.assertEqual(
            material.additional_metadata["num_samples"],
            self.test_accession_with_pubmed_id_num_samples,
        )

    def test_import_succeeds_for_study_without_pubmed_id(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("materials-import")
        response = self.client.post(
            url,
            {
                "import_type": "SRA",
                "study_accession": self.test_accession_without_pubmed_id,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, self.org)
        self.assertEqual(material.grants.first(), self.grant)
        self.assertEqual(
            material.additional_metadata["study_id"], self.test_accession_without_pubmed_id
        )
        self.assertEqual(
            material.additional_metadata["num_samples"],
            self.test_accession_without_pubmed_id_num_samples,
        )

    def test_import_from_unauthenticated_fails(self):
        url = reverse("materials-import")
        response = self.client.post(
            url,
            {
                "import_type": "SRA",
                "study_accession": self.test_accession_with_pubmed_id,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_import_from_user_who_does_not_own_grant_fails(self):
        self.client.force_authenticate(user=self.user)

        self.org.members.remove(self.user)
        self.org.save()

        url = reverse("materials-import")
        response = self.client.post(
            url,
            {
                "import_type": "SRA",
                "study_accession": self.test_accession_with_pubmed_id,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_import_from_user_not_in_organization_fails(self):
        self.client.force_authenticate(user=self.user)

        self.user.grants.remove(self.grant)
        self.user.save()

        url = reverse("materials-import")
        response = self.client.post(
            url,
            {
                "import_type": "SRA",
                "study_accession": self.test_accession_with_pubmed_id,
                "organization_id": self.org.id,
                "grant_id": self.grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
