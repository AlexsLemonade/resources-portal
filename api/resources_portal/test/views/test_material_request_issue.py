from django.forms.models import model_to_dict
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import MaterialShareEvent, Notification, OrganizationUserSetting
from resources_portal.test.factories import (
    MaterialFactory,
    MaterialRequestFactory,
    MaterialRequestIssueFactory,
    UserFactory,
)
from resources_portal.views.material_request_issue import (
    MATERIAL_ARCHIVED_ERROR,
    REQUEST_UNFULFILLED_ERROR,
)

fake = Faker()


class TestMaterialRequestIssueListTestCase(APITestCase):
    """
    Tests /materials-request list operations.
    """

    def setUp(self):
        self.material = MaterialFactory()
        self.request = MaterialRequestFactory(
            material=self.material, assigned_to=self.material.contact_user, status="IN_FULFILLMENT"
        )

        self.sharer = self.request.material.contact_user
        self.organization = self.request.material.organization
        self.request.material.save()

        self.organization.members.add(self.sharer)
        self.organization.assign_member_perms(self.sharer)
        self.organization.assign_owner_perms(self.sharer)

        self.request_issue = MaterialRequestIssueFactory(material_request=self.request)

        self.request_issue_data = model_to_dict(self.request_issue)
        self.url = reverse("material-requests-issues-list", args=[self.request.id])

        self.user = self.request.requester
        self.user_without_perms = UserFactory()

    def test_post_request_with_no_data_fails(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        self.request.status = "FULFILLED"
        self.request.save()

        self.client.force_authenticate(user=self.user)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        response = self.client.post(self.url, self.request_issue_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Make sure that the request got moved back to INFULFILLMENT
        self.request.refresh_from_db()
        self.assertEqual(self.request.status, "IN_FULFILLMENT")

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_ISSUE_SHARER_REPORTED"
                )
            ),
            self.organization.members.count(),
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_ISSUE_OPENED")), 1,
        )

    def test_post_request_unfulfilled_error(self):
        self.client.force_authenticate(user=self.user)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        response = self.client.post(self.url, self.request_issue_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["reason"], REQUEST_UNFULFILLED_ERROR)

    def test_post_request_archived_error(self):
        # If status is not FULFILLED then we get a different error.
        self.request.status = "FULFILLED"
        self.request.save()
        self.request.material.is_archived = True
        self.request.material.save()

        self.client.force_authenticate(user=self.user)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        response = self.client.post(self.url, self.request_issue_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["reason"], MATERIAL_ARCHIVED_ERROR)

    def test_post_request_from_unauthenticated_forbidden(self):
        # If status is not FULFILLED then we get a different error.
        self.request.status = "FULFILLED"
        self.request.save()
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.request_issue_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_request_from_sharer_succeeds(self):
        self.client.force_authenticate(user=self.sharer)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_from_requester_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_from_sharer_filters(self):
        self.client.force_authenticate(user=self.sharer)
        response = self.client.get(self.url + "?status=OPEN")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_from_sharer_filters_out(self):
        self.client.force_authenticate(user=self.sharer)
        response = self.client.get(self.url + "?status=CLOSED")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 0)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestSingleMaterialRequestIssueTestCase(APITestCase):
    def setUp(self):
        self.material = MaterialFactory()
        self.request = MaterialRequestFactory(
            material=self.material, assigned_to=self.material.contact_user
        )
        self.request.status = "IN_FULFILLMENT"
        self.request.save()

        self.sharer = self.request.material.contact_user
        self.organization = self.request.material.organization
        self.request.material.save()

        self.organization.members.add(self.sharer)
        self.organization.assign_member_perms(self.sharer)
        self.organization.assign_owner_perms(self.sharer)

        self.request_issue = MaterialRequestIssueFactory(material_request=self.request)

        self.request_issue_data = model_to_dict(self.request_issue)
        self.url = reverse(
            "material-requests-issues-detail", args=[self.request.id, self.request_issue.id]
        )

        self.user = self.request.requester
        self.user_without_perms = UserFactory()

    def test_get_request_from_sharer_succeeds(self):
        self.client.force_authenticate(user=self.sharer)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_from_requester_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_request_without_perms_fails(self):
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_request_from_sharer_updates_a_material_request(self):
        self.client.force_authenticate(user=self.sharer)

        organization = self.request.material.organization
        OrganizationUserSetting.objects.get_or_create(user=self.sharer, organization=organization)

        self.request_issue_data["status"] = "CLOSED"

        response = self.client.put(self.url, self.request_issue_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.request_issue.refresh_from_db()
        self.assertEqual(self.request_issue.status, "CLOSED")

        # Closing an issue should move a request back to FULFILLED
        self.request.refresh_from_db()
        self.assertEqual(self.request.status, "FULFILLED")

        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_FULFILLED")),
            organization.members.count(),
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_ISSUE_CLOSED")), 1,
        )

    def test_put_request_from_requester_updates_a_material_request(self):
        self.client.force_authenticate(user=self.request.requester)

        organization = self.request.material.organization
        OrganizationUserSetting.objects.get_or_create(user=self.sharer, organization=organization)

        self.request_issue_data["status"] = "CLOSED"

        response = self.client.put(self.url, self.request_issue_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.request_issue.refresh_from_db()
        self.assertEqual(self.request_issue.status, "CLOSED")

        # Closing an issue should move a request back to FULFILLED
        self.request.refresh_from_db()
        self.assertEqual(self.request.status, "FULFILLED")

        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_FULFILLED")),
            organization.members.count(),
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_ISSUE_CLOSED")), 1,
        )

    def test_put_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)

        self.request_issue_data["status"] = "CLOSED"

        response = self.client.put(self.url, self.request_issue_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)

        self.request_issue_data["status"] = "CLOSED"

        response = self.client.put(self.url, self.request_issue_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_request_fails(self):
        self.user.is_staff = True
        self.user.save()
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
