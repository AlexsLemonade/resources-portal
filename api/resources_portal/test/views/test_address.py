from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Address
from resources_portal.test.factories import AddressFactory, UserFactory

fake = Faker()


class AddressListTestCase(APITestCase):
    """
    Tests /address list operations.
    """

    def setUp(self):
        self.address = AddressFactory()
        self.other_user = UserFactory()
        self.url = reverse("users-addresses-list", args=[self.address.user.id])
        self.address_data = model_to_dict(self.address)
        self.client.force_authenticate(user=self.address.user)

    def test_post_request_with_no_data_fails(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        new_address_data = self.address_data.copy()
        new_address_data.pop("user")
        response = self.client.post(self.url, new_address_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(str(self.address_data["user"]), response.json()["user"])

    def test_post_request_may_not_specify_user(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(self.url, self.address_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.address_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class SingleAddressTestCase(APITestCase):
    """
    Tests /user/<user-id>/address/<address-id> detail operations.
    """

    def setUp(self):
        self.address = AddressFactory()
        self.other_user = UserFactory()
        self.url = reverse("users-addresses-detail", args=[self.address.user.id, self.address.id])

    def test_get_request_returns_a_given_address(self):
        self.client.force_authenticate(user=self.address.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_address(self):
        self.client.force_authenticate(user=self.address.user)
        address_json = self.client.get(self.url).json()

        new_suite = "Suite 4000"
        address_json["address_line_2"] = new_suite

        response = self.client.put(self.url, address_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        address = Address.objects.get(id=self.address.id)
        self.assertEqual(address.address_line_2, new_suite)

    def test_put_request_from_wrong_user_fails(self):
        self.client.force_authenticate(user=self.other_user)
        address_json = self.client.get(self.url).json()

        address_json["address_line_2"] = "Suite 4000"

        response = self.client.put(self.url, address_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        address_json = self.client.get(self.url).json()

        address_json["address_line_2"] = "Suite 4000"

        response = self.client.put(self.url, address_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_deletes_address(self):
        self.client.force_authenticate(user=self.address.user)
        address_id = self.address.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Address.objects.filter(id=address_id).count(), 0)

    def test_delete_request_from_other_user_fails(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_only_soft_deletes_objects(self):
        self.client.force_authenticate(user=self.address.user)
        address_id = self.address.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Address.deleted_objects.filter(id=address_id).count(), 1)
