from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import ShippingRequirement
from resources_portal.test.factories import (
    OrganizationFactory,
    ShippingRequirementFactory,
    UserFactory,
)

fake = Faker()


class ShippingRequirementListTestCase(APITestCase):
    """
    Tests /shipping_requirement list operations.
    """

    def setUp(self):
        self.organization = OrganizationFactory()
        self.user = UserFactory()
        self.organization.members.add(self.user)
        self.shipping_requirement = ShippingRequirementFactory(organization=self.organization)
        self.other_user = UserFactory()
        self.url = reverse("shipping-requirement-list")
        self.shipping_requirement_data = model_to_dict(self.shipping_requirement)

    def test_post_request_with_no_data_fails(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_request_with_valid_data_succeeds(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, self.shipping_requirement_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_post_request_fails_from_wrong_user(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(self.url, self.shipping_requirement_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.shipping_requirement_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SingleShippingRequirementTestCase(APITestCase):
    """
    Tests /user/<user-id>/shipping_requirement/<shipping_requirement-id> detail operations.
    """

    def setUp(self):
        self.organization = OrganizationFactory()
        self.user = UserFactory()
        self.organization.members.add(self.user)
        self.shipping_requirement = ShippingRequirementFactory(organization=self.organization)
        self.other_user = UserFactory()
        self.url = reverse("shipping-requirement-detail", args=[self.shipping_requirement.id])
        self.shipping_requirement_data = model_to_dict(self.shipping_requirement)

    def test_get_request_returns_a_given_shipping_requirement(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_shipping_requirement(self):
        self.client.force_authenticate(user=self.user)
        shipping_requirement_json = self.client.get(self.url).json()

        new_restriction = "South America only."
        shipping_requirement_json["restrictions"] = new_restriction

        response = self.client.put(self.url, shipping_requirement_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        shipping_requirement = ShippingRequirement.objects.get(id=self.shipping_requirement.id)
        self.assertEqual(shipping_requirement.restrictions, new_restriction)

    def test_put_request_from_wrong_user_fails(self):
        self.client.force_authenticate(user=self.other_user)
        shipping_requirement_json = self.client.get(self.url).json()

        shipping_requirement_json["restrictions"] = "South America only."

        response = self.client.put(self.url, shipping_requirement_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        shipping_requirement_json = self.client.get(self.url).json()

        shipping_requirement_json["restrictions"] = "South America only."

        response = self.client.put(self.url, shipping_requirement_json)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_request_deletes_shipping_requirement(self):
        self.client.force_authenticate(user=self.user)
        shipping_requirement_id = self.shipping_requirement.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ShippingRequirement.objects.filter(id=shipping_requirement_id).count(), 0)

    def test_delete_request_from_other_user_fails(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_request_only_soft_deletes_objects(self):
        self.client.force_authenticate(user=self.user)
        shipping_requirement_id = self.shipping_requirement.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(
            ShippingRequirement.deleted_objects.filter(id=shipping_requirement_id).count(), 1
        )
