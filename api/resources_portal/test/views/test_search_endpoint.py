import datetime

from django.core.management import call_command
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from resources_portal.management.commands.populate_dev_database import populate_dev_database
from resources_portal.models import Material, Organization, User


class SearchMaterialsEndpointTestCase(APITestCase):
    """
    Tests /search/materials operations.
    """

    @classmethod
    def setUpClass(cls):
        super(SearchMaterialsEndpointTestCase, cls).setUpClass()

        populate_dev_database()

        # Put newly created materials in the search index
        call_command("search_index", "-f", "--rebuild")

        cls.primary_prof = User.objects.get(username="PrimaryProf")
        cls.secondary_prof = User.objects.get(username="SecondaryProf")
        cls.post_doc = User.objects.get(username="PostDoc")

        cls.primary_lab = Organization.objects.get(name="PrimaryLab")

        cls.material1 = Material.objects.get(title="Melanoma Reduction Plasmid")
        cls.material2 = Material.objects.get(title="Allele Extraction Protocol")

    @classmethod
    def tearDownClass(cls):
        super(SearchMaterialsEndpointTestCase, cls).tearDownClass()

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


class SearchUsersEndpointTestCase(APITestCase):
    """
    Tests /search/users operations.
    """

    @classmethod
    def setUpClass(cls):
        super(SearchUsersEndpointTestCase, cls).setUpClass()

        populate_dev_database()

        # Put newly created materials in the search index
        call_command("search_index", "-f", "--rebuild")

        cls.primary_prof = User.objects.get(username="PrimaryProf")

    @classmethod
    def tearDownClass(cls):
        super(SearchUsersEndpointTestCase, cls).tearDownClass()

        # Rebuild search index with what's actaully in the django database
        call_command("search_index", "-f", "--rebuild")

    def test_search_for_name_returns_given_user(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = (
            reverse("search-users-list")
            + "?search="
            + self.primary_prof.first_name
            + " "
            + self.primary_prof.last_name
        )

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        first_result_id = response.json()["results"][0]["id"]

        self.assertEqual(first_result_id, str(self.primary_prof.id))

    def test_order_by_published_name_succeeds(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-users-list") + "?ordering=published_name"

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user_published_names = []
        for user in response.json()["results"]:
            if user["published_name"]:
                user_published_names.append(user["published_name"])

        self.assertEqual(user_published_names, sorted(user_published_names))

    def test_empty_search_returns_no_results(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-users-list") + "?search="

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user_count = int(response.json()["count"])

        self.assertEqual(user_count, 0)


class SearchOrganizationsEndpointTestCase(APITestCase):
    """
    Tests /search/organizations operations.
    """

    @classmethod
    def setUpClass(cls):
        super(SearchOrganizationsEndpointTestCase, cls).setUpClass()

        populate_dev_database()

        # Put newly created materials in the search index
        call_command("search_index", "-f", "--rebuild")

        cls.primary_prof = User.objects.get(username="PrimaryProf")
        cls.primary_lab = Organization.objects.get(name="PrimaryLab")

    @classmethod
    def tearDownClass(cls):
        super(SearchOrganizationsEndpointTestCase, cls).tearDownClass()

        # Rebuild search index with what's actaully in the django database
        call_command("search_index", "-f", "--rebuild")

    def test_search_for_organization_name_returns_given_organization(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-organizations-list") + "?search=" + self.primary_lab.name

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        first_result_id = int(response.json()["results"][0]["id"])

        self.assertEqual(first_result_id, self.primary_lab.id)

    def test_search_for_owner_attribute_returns_related_organizations(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-organizations-list") + "?search=" + self.primary_prof.email

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        organization_count = int(response.json()["count"])

        organization_names = []
        for org in response.json()["results"]:
            organization_names.append(org["name"])

        self.assertEqual(
            organization_count, len(Organization.objects.filter(owner=self.primary_prof))
        )

        for name in organization_names:
            self.assertTrue(
                Organization.objects.filter(name=name, owner=self.primary_prof).exists()
            )

    def test_ordering_on_updated_at_succeeds(self):
        self.client.force_authenticate(user=self.primary_prof)

        search_url = reverse("search-organizations-list") + "?ordering=" + "updated_at"

        response = self.client.get(search_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        organization_dates = []
        for org in response.json()["results"]:
            date = datetime.datetime.strptime(org["updated_at"], "%Y-%m-%dT%H:%M:%S.%f%z").date()
            organization_dates.append(date)

        self.assertEqual(organization_dates, sorted(organization_dates))
