from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import FulfillmentNote, MaterialShareEvent
from resources_portal.test.factories import FulfillmentNoteFactory, UserFactory

fake = Faker()


class FulfillmentNoteListTestCase(APITestCase):
    """
    Tests /fulfillment_note list operations.
    """

    def setUp(self):
        self.fulfillment_note = FulfillmentNoteFactory()
        self.other_user = UserFactory()
        self.url = reverse(
            "material-requests-notes-list", args=[self.fulfillment_note.material_request.id]
        )
        self.fulfillment_note_data = model_to_dict(self.fulfillment_note)
        self.client.force_authenticate(user=self.fulfillment_note.created_by)

    def test_post_request_with_no_data_fails(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        new_fulfillment_note_data = self.fulfillment_note_data.copy()
        new_fulfillment_note_data.pop("created_by")
        response = self.client.post(self.url, new_fulfillment_note_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(
            str(self.fulfillment_note_data["created_by"]), response.json()["created_by"]
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_FULFILLMENT_NOTE_ADDED")), 1,
        )

    def test_post_request_may_not_specify_user(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(self.url, self.fulfillment_note_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.fulfillment_note_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SingleFulfillmentNoteTestCase(APITestCase):
    """
    Tests /user/<user-id>/fulfillment_note/<fulfillment_note-id> detail operations.
    """

    def setUp(self):
        self.fulfillment_note = FulfillmentNoteFactory()
        self.fulfillment_note.material_request.material.organization.members.add(
            self.fulfillment_note.created_by
        )

        self.other_user = UserFactory()
        self.url = reverse(
            "material-requests-notes-detail",
            args=[self.fulfillment_note.material_request.id, self.fulfillment_note.id],
        )

    def test_get_request_returns_a_given_fulfillment_note(self):
        self.client.force_authenticate(user=self.fulfillment_note.created_by)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_request_updates_fulfillment_note(self):
        self.client.force_authenticate(user=self.fulfillment_note.created_by)
        fulfillment_note_json = self.client.get(self.url).json()

        new_text = "Oops I mean XYZ123."
        fulfillment_note_json["text"] = new_text

        response = self.client.put(self.url, fulfillment_note_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        fulfillment_note = FulfillmentNote.objects.get(id=self.fulfillment_note.id)
        self.assertEqual(fulfillment_note.text, new_text)

    def test_put_request_from_wrong_user_fails(self):
        self.client.force_authenticate(user=self.other_user)
        fulfillment_note_json = self.client.get(self.url).json()

        fulfillment_note_json["text"] = "Oops I mean XYZ123."

        response = self.client.put(self.url, fulfillment_note_json)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_without_authentication_fails(self):
        self.client.force_authenticate(user=None)
        fulfillment_note_json = self.client.get(self.url).json()

        fulfillment_note_json["text"] = "Oops I mean XYZ123."

        response = self.client.put(self.url, fulfillment_note_json)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_request_deletes_fulfillment_note(self):
        self.client.force_authenticate(user=self.fulfillment_note.created_by)
        fulfillment_note_id = self.fulfillment_note.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(FulfillmentNote.objects.filter(id=fulfillment_note_id).count(), 0)

    def test_delete_request_from_other_user_fails(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_request_only_soft_deletes_objects(self):
        self.client.force_authenticate(user=self.fulfillment_note.created_by)
        fulfillment_note_id = self.fulfillment_note.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(FulfillmentNote.deleted_objects.filter(id=fulfillment_note_id).count(), 1)
