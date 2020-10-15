from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker
from guardian.shortcuts import assign_perm

from resources_portal.models import Material, MaterialShareEvent, Notification
from resources_portal.test.factories import (
    AttachmentFactory,
    MaterialFactory,
    MaterialRequestFactory,
    OrganizationFactory,
    ShippingRequirementFactory,
    UserFactory,
)

fake = Faker()


class TestMaterialListTestCase(APITestCase):
    """
    Tests /materials list operations.
    """

    def setUp(self):
        self.url = reverse("material-list")
        self.user = UserFactory()
        self.user_without_perms = UserFactory()
        self.organization = OrganizationFactory(owner=self.user)
        self.material = MaterialFactory(
            contact_user=self.user, organization=self.organization, category="PLASMID"
        )
        self.material_data = model_to_dict(self.material)

    def test_post_request_with_no_data_fails(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_request_with_valid_data_succeeds(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, self.material_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(self.material.category, response.json()["category"])
        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_ADDED")),
            self.organization.members.count(),
        )

    def test_post_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.post(self.url, self.material_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.material_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_request_succeeds(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_limit_succeeds(self):
        for i in range(4):
            MaterialFactory(category="CELL_LINE")

        self.client.force_authenticate(user=None)
        response = self.client.get(self.url + "?limit=3")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.json()["results"]), 3)

    def test_get_request_filter_succeeds(self):
        for i in range(11):
            last_material = MaterialFactory(category="CELL_LINE")

        self.client.force_authenticate(user=None)

        response = self.client.get(self.url + "?category=CELL_LINE")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.json()["results"]), 10)

        response = self.client.get(self.url + "?category=PLASMID")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.json()["results"]), 1)

        last_org_id = last_material.organization.id
        response = self.client.get(self.url + f"?organization__id={last_org_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.json()["results"]), 1)

    def test_import_previously_imported_geo_fails(self):
        self.client.force_authenticate(user=self.user)
        accession_code = "12345"

        material = MaterialFactory(
            imported=True,
            import_source="GEO",
            contact_user=self.user,
            organization=self.organization,
            additional_metadata={"accession_code": accession_code},
        )

        imported_data = model_to_dict(material)

        # Try to import the same material again
        response = self.client.post(self.url, imported_data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error_code"], "ALREADY_IMPORTED")
        self.assertEqual(
            response.json()["material"]["additional_metadata"]["accession_code"], accession_code
        )

    def test_import_previously_imported_protocol_fails(self):
        self.client.force_authenticate(user=self.user)
        protocol_doi = "12345"
        response = self.client.post(
            self.url, {"import_source": "PROTOCOLS_IO", "protocol_doi": protocol_doi}
        )

        material = MaterialFactory(
            imported=True,
            import_source="PROTOCOLS_IO",
            contact_user=self.user,
            organization=self.organization,
            additional_metadata={"protocol_doi": protocol_doi},
        )

        imported_data = model_to_dict(material)

        # Try to import the same material again
        response = self.client.post(self.url, imported_data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error_code"], "ALREADY_IMPORTED")
        self.assertEqual(
            response.json()["material"]["additional_metadata"]["protocol_doi"], protocol_doi
        )

    def test_import_previously_imported_sra_fails(self):
        self.client.force_authenticate(user=self.user)
        accession_code = "12345"
        response = self.client.post(
            self.url, {"import_source": "SRA", "accession_code": accession_code}
        )
        material = MaterialFactory(
            imported=True,
            import_source="SRA",
            contact_user=self.user,
            organization=self.organization,
            additional_metadata={"accession_code": accession_code},
        )

        imported_data = model_to_dict(material)

        # Try to import the same material again
        response = self.client.post(self.url, imported_data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error_code"], "ALREADY_IMPORTED")
        self.assertEqual(
            response.json()["material"]["additional_metadata"]["accession_code"], accession_code
        )


class TestSingleMaterialTestCase(APITestCase):
    """
    Tests /materials detail operations.
    """

    def setUp(self):
        self.user = UserFactory()
        self.user_without_perms = UserFactory()
        self.organization = OrganizationFactory(owner=self.user)
        self.organization2 = OrganizationFactory(owner=self.user)
        self.organization_without_perms = OrganizationFactory()
        self.material = MaterialFactory(contact_user=self.user, organization=self.organization)
        self.url = reverse("material-detail", args=[self.material.id])

        assign_perm("delete_resources", self.user, self.organization)

    def test_get_request_returns_no_requests_if_no_user(self):
        self.client.force_authenticate(user=None)
        # Add a request to be filtered out.
        MaterialRequestFactory(material=self.material)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("requests" not in response.json())

    def test_get_request_returns_all_requests_if_user_in_org(self):
        self.client.force_authenticate(user=self.user)
        # Add a request to be filtered out.
        MaterialRequestFactory(material=self.material)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["requests"]), 1)

    def test_get_request_filters_requests_if_user_not_in_org(self):
        requester = UserFactory()
        self.client.force_authenticate(user=requester)
        # Add a request to not be filtered out.
        MaterialRequestFactory(requester=requester, material=self.material)
        # Add a request to be filtered out.
        MaterialRequestFactory(material=self.material)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["requests"]), 1)

    def test_put_request_updates_a_material(self):
        self.client.force_authenticate(user=self.user)
        material_json = self.client.get(self.url).json()

        new_url = fake.url()
        material_json["url"] = new_url
        material_json["contact_user"] = material_json["contact_user"]["id"]
        material_json["is_archived"] = True
        material_json["organization"] = material_json["organization"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_ARCHIVED")),
            self.organization.members.count(),
        )

        material = Material.objects.get(pk=self.material.id)
        self.assertEqual(material.url, new_url)

    def test_put_request_can_update_organization(self):
        self.client.force_authenticate(user=self.user)
        material_json = self.client.get(self.url).json()

        material_json["organization"] = self.organization2.id
        material_json["contact_user"] = material_json["contact_user"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertTrue(self.material in self.organization2.materials.all())

    def test_put_request_cannot_archive_with_active_requests(self):
        MaterialRequestFactory(material=self.material)

        self.client.force_authenticate(user=self.user)
        material_json = self.client.get(self.url).json()

        material_json["is_archived"] = True

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_request_on_organization_without_permissions_for_both_orgs_fails(self):
        self.client.force_authenticate(user=self.user)
        material_json = self.client.get(self.url).json()

        material_json["organization"] = self.organization_without_perms.id
        material_json["contact_user"] = material_json["contact_user"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_cannot_change_category(self):
        self.client.force_authenticate(user=self.user)
        material_json = self.client.get(self.url).json()

        material_json["category"] = "PLASMID"

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)
        material_json = self.client.get(self.url).json()

        new_url = fake.url()
        material_json["url"] = new_url
        material_json["contact_user"] = material_json["contact_user"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        material_json = self.client.get(self.url).json()

        new_url = fake.url()
        material_json["url"] = new_url
        material_json["contact_user"] = material_json["contact_user"]["id"]

        response = self.client.put(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_request_updates_a_material_irb(self):
        self.client.force_authenticate(user=self.user)

        material_json = {"needs_irb": True}

        response = self.client.patch(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="MATERIAL_IRB_REQUIREMENTS_CHANGED")),
            1,
        )

    def test_patch_request_updates_a_material_abstract(self):
        self.client.force_authenticate(user=self.user)

        material_json = {"needs_abstract": True}

        response = self.client.patch(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                MaterialShareEvent.objects.filter(
                    event_type="MATERIAL_ABSTRACT_REQUIREMENTS_CHANGED"
                )
            ),
            1,
        )

    def test_patch_request_updates_a_material_shipping(self):
        self.client.force_authenticate(user=self.user)

        shipping_requirement = ShippingRequirementFactory(organization=self.organization)
        material_json = {"shipping_requirement": shipping_requirement.id}

        response = self.client.patch(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                MaterialShareEvent.objects.filter(
                    event_type="MATERIAL_SHIPPING_REQUIREMENTS_CHANGED"
                )
            ),
            1,
        )

    def test_patch_request_updates_a_material_mta(self):
        self.client.force_authenticate(user=self.user)

        new_mta = AttachmentFactory(owned_by_user=self.user)
        material_json = {"mta_attachment": new_mta.id}

        response = self.client.patch(self.url, material_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="MATERIAL_MTA_REQUIREMENTS_CHANGED")),
            1,
        )

    def test_delete_request_deletes_a_material(self):
        self.client.force_authenticate(user=self.user)
        material_id = self.material.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Material.objects.filter(id=material_id).count(), 0)

        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_DELETED")),
            self.organization.members.count(),
        )

    def test_delete_material_with_request_fails(self):
        MaterialRequestFactory(material=self.material)
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_only_soft_deletes_objects(self):
        self.client.force_authenticate(user=self.user)
        material_id = self.material.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Material.deleted_objects.filter(id=material_id).count(), 1)
