from json import loads

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
        self.test_accession = "SRR4199304"

    def test_import_sra_succeeds(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)

        org = OrganizationFactory()
        grant = GrantFactory()

        user.grants.add(grant)
        user.save()

        org.members.add(user)
        org.save()

        url = reverse("import-sra")
        response = self.client.post(
            url,
            {
                "import_type": "SRA",
                "run_accession": self.test_accession,
                "organization_id": org.id,
                "grant_id": grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        material = Material.objects.get(pk=response.json()["id"])

        self.assertEqual(material.organization, org)
        self.assertEqual(material.grants.first(), grant)

    def test_import_sra_from_unauthenticated_fails(self):
        org = OrganizationFactory()
        grant = GrantFactory()

        url = reverse("import-sra")
        response = self.client.post(
            url,
            {
                "import_type": "SRA",
                "run_accession": self.test_accession,
                "organization_id": org.id,
                "grant_id": grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_import_sra_from_user_who_does_not_own_grant_fails(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)

        org = OrganizationFactory()
        grant = GrantFactory()

        org.members.add(user)
        org.save()

        url = reverse("import-sra")
        response = self.client.post(
            url,
            {
                "import_type": "SRA",
                "run_accession": self.test_accession,
                "organization_id": org.id,
                "grant_id": grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_import_sra_from_user_not_in_organization_fails(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)

        org = OrganizationFactory()
        grant = GrantFactory()

        user.grants.add(grant)
        user.save()

        url = reverse("import-sra")
        response = self.client.post(
            url,
            {
                "import_type": "SRA",
                "run_accession": self.test_accession,
                "organization_id": org.id,
                "grant_id": grant.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
