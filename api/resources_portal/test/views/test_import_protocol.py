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
        self.test_protocol_doi = "dx.doi.org/10.17504/protocols.io.bazhif36"

        self.org = OrganizationFactory()
        self.grant = GrantFactory()
        self.user = UserFactory()

        self.user.grants.add(self.grant)
        self.user.save()

        self.org.members.add(self.user)
        self.org.save()

    def test_import_sra_succeeds_for_study_with_pubmed_id(self):
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
