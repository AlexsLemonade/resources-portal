import datetime

from django.core.management import call_command
from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.management.commands.populate_dev_database import populate_dev_database
from resources_portal.models import (
    Attachment,
    Material,
    MaterialRequest,
    Notification,
    Organization,
    OrganizationUserSetting,
    User,
)
from resources_portal.test.utils import (
    generate_mock_orcid_authorization_response,
    generate_mock_orcid_record_response,
    get_mock_oauth_url,
)


class SearchMaterialsEndpointTestCase(APITestCase):
    """
    Tests /search/materials operations.
    """

    @classmethod
    def setUpClass(cls):
        populate_dev_database()

        # Put newly created materials in the search index
        call_command("search_index", "-f", "--rebuild")

        cls.primary_prof = User.objects.get(username="PrimaryProf")
        cls.secondary_prof = User.objects.get(username="SecondaryProf")
        cls.post_doc = User.objects.get(username="PostDoc")

        cls.primary_lab = Organization.objects.get(name="PrimaryLab")

        cls.material1 = Material.objects.get(title="Melanoma Reduction Plasmid")
        cls.material2 = Material.objects.get(title="Allele Extraction Protocol")

        super(SearchMaterialsEndpointTestCase, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        # Rebuild search index with what's actaully in the django database
        call_command("search_index", "-f", "--rebuild")

    def test_search_for_title_finds_a_given_material(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-materials-list") + "?search=" + self.material1.title

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        first_result_id = int(response.json()["results"][0]["id"])

        self.assertEqual(first_result_id, self.material1.id)

    def test_filter_on_organization_retrieves_all_organization_materials(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-materials-list") + "?organization=" + self.primary_lab.name

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_count = int(response.json()["count"])

        material_titles = []
        for material in response.json()["results"]:
            material_titles.append(material["title"])

        self.assertEqual(material_count, len(self.primary_lab.materials.all()))

        for title in material_titles:
            self.assertTrue(
                Material.objects.filter(title=title, organization=self.primary_lab).exists()
            )

    def test_filter_on_category_retrieves_all_materials_of_a_given_category(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-materials-list") + "?category=" + "MODEL_ORGANISM"

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_count = int(response.json()["count"])

        material_titles = []
        for material in response.json()["results"]:
            material_titles.append(material["title"])

        self.assertEqual(material_count, len(Material.objects.filter(category="MODEL_ORGANISM")))

        for title in material_titles:
            self.assertTrue(
                Material.objects.filter(title=title, category="MODEL_ORGANISM").exists()
            )

    def test_filter_on_organisms_retrieves_all_materials_with_one_organism(self):
        self.client.force_authenticate(user=self.primary_prof)

        # Search with one organism name
        search_url = reverse("search-materials-list") + "?organisms=" + "danio rerio"

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        organism_count = int(response.json()["count"])

        material_titles = []
        for material in response.json()["results"]:
            material_titles.append(material["title"])

        database_organism_count = 0
        database_titles = []
        for material in Material.objects.all():
            if material.organisms:
                if "Danio rerio" in material.organisms:
                    database_organism_count += 1
                    database_titles.append(material.title)

        self.assertEqual(organism_count, database_organism_count)

        for title in material_titles:
            self.assertTrue(title in database_titles)

    def test_filter_on_organisms_retrieves_all_materials_with_multiple_organisms(self):
        self.client.force_authenticate(user=self.primary_prof)

        # Search with one organism name
        search_url = (
            reverse("search-materials-list")
            + "?organisms="
            + "danio rerio"
            + "&organisms="
            + "mus musculus"
        )

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        organism_count = int(response.json()["count"])

        material_titles = []
        for material in response.json()["results"]:
            material_titles.append(material["title"])

        database_organism_count = 0
        database_titles = []
        for material in Material.objects.all():
            if material.organisms:
                if ("Danio rerio" in material.organisms) or ("Mus musculus" in material.organisms):
                    database_organism_count += 1
                    database_titles.append(material.title)

        self.assertEqual(organism_count, database_organism_count)

        for title in material_titles:
            self.assertTrue(title in database_titles)

    def test_ordering_on_updated_at_succeeds(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-materials-list") + "?ordering=" + "updated_at"

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_dates = []
        for material in response.json()["results"]:
            date = datetime.datetime.strptime(
                material["updated_at"], "%Y-%m-%dT%H:%M:%S.%f%z"
            ).date()
            material_dates.append(date)

        self.assertEqual(material_dates, sorted(material_dates))

    def test_combine_search_and_filter_and_ordering_succeeds(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = (
            reverse("search-materials-list")
            + "?search=MODEL_ORGANISM"
            + "ordering=updated_at"
            + "has_pre_print=true"
        )

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_dates = []
        material_titles = []
        for material in response.json()["results"]:
            material_titles.append(material["title"])

            date = datetime.datetime.strptime(
                material["updated_at"], "%Y-%m-%dT%H:%M:%S.%f%z"
            ).date()
            material_dates.append(date)

        self.assertEqual(material_dates, sorted(material_dates))

        for title in material_titles:
            self.assertTrue(
                Material.objects.filter(
                    title=title, category="MODEL_ORGANISM", has_pre_print=True
                ).exists()
            )

    def test_facets_return_number_of_materials(self):
        self.client.force_authenticate(user=self.primary_prof)

        # Search with no params
        search_url = reverse("search-materials-list")

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        model_organism_count = int(response.json()["facets"]["category"]["MODEL_ORGANISM"])

        self.assertEqual(
            model_organism_count, len(Material.objects.filter(category="MODEL_ORGANISM"))
        )

        # Search for only danio rerio organisms
        search_url = reverse("search-materials-list") + "?search=danio rerio"

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        model_organism_count = int(response.json()["facets"]["category"]["MODEL_ORGANISM"])

        database_count = 0
        for material in Material.objects.all():
            if material.organisms:
                if ("Danio rerio" in material.organisms) and (
                    material.category == "MODEL_ORGANISM"
                ):
                    database_count += 1

        self.assertEqual(model_organism_count, database_count)

    def test_empty_search_returns_no_results(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-materials-list") + "?search="

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_count = int(response.json()["count"])

        self.assertEqual(material_count, 0)
