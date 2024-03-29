import datetime

from django.forms.models import model_to_dict
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import (
    MaterialRequest,
    MaterialShareEvent,
    Notification,
    OrganizationUserSetting,
)
from resources_portal.test.factories import (
    AddressFactory,
    AttachmentFactory,
    MaterialFactory,
    MaterialRequestFactory,
    MaterialRequestIssueFactory,
    OrganizationFactory,
    ShippingRequirementFactory,
    UserFactory,
)

fake = Faker()


class TestMaterialRequestListTestCase(APITestCase):
    """
    Tests /materials-requests list operations.
    """

    def setUp(self):
        self.url = reverse("material-request-list")
        self.request = MaterialRequestFactory()

        self.sharer = self.request.material.contact_user
        self.organization = self.request.material.organization
        self.request.material.save()

        self.organization.members.add(self.sharer)
        self.organization.assign_member_perms(self.sharer)
        self.organization.assign_owner_perms(self.sharer)

        self.material_request_data = model_to_dict(self.request)

        self.user_without_perms = UserFactory()

    def test_post_request_with_no_data_fails(self):
        self.client.force_authenticate(user=self.request.requester)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        response = self.client.post(self.url, self.material_request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_SHARER_ASSIGNED_NEW"
                )
            ),
            1,
        )
        # Does not notify the assignee, because they are notified specially.
        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_RECEIVED")),
            self.organization.members.count() - 1,
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_OPENED")),
            1,
        )

    def test_post_request_with_address_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        address = AddressFactory()
        self.material_request_data["address"] = address.id

        response = self.client.post(self.url, self.material_request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_SHARER_ASSIGNED_NEW"
                )
            ),
            1,
        )
        # Does not notify the assignee, because they are notified specially.
        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_RECEIVED")),
            self.organization.members.count() - 1,
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_OPENED")),
            1,
        )

        created_request = MaterialRequest.objects.get(id=response.json()["id"])
        self.assertEqual(created_request.address.id, address.id)

    def test_post_request_with_invalid_data_fails(self):
        self.client.force_authenticate(user=self.request.requester)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        self.material_request_data["payment_method"] = "I won't pay!"
        response = self.client.post(self.url, self.material_request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_with_valid_data_fails_if_archived(self):
        self.request.material.is_archived = True
        self.request.material.save()

        self.client.force_authenticate(user=self.request.requester)

        OrganizationUserSetting.objects.get_or_create(
            user=self.sharer, organization=self.request.material.organization
        )

        response = self.client.post(self.url, self.material_request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.material_request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_request_from_sharer_succeeds(self):
        self.client.force_authenticate(user=self.sharer)

        self.request.created_at = timezone.now() - datetime.timedelta(days=8)
        self.request.save()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

        self.assertIn("organization", response.json()["results"][0]["material"])
        self.assertEqual("a week ago", response.json()["results"][0]["human_readable_created_at"])

    def test_get_request_from_requester_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)

        self.request.created_at = timezone.now() - datetime.timedelta(days=15)
        self.request.save()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)
        self.assertEqual("2 weeks ago", response.json()["results"][0]["human_readable_created_at"])

    def test_get_request_filters(self):
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 0)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestSingleMaterialRequestTestCase(APITestCase):
    def setUp(self):
        self.organization = OrganizationFactory()
        self.sharer = self.organization.owner
        self.material = MaterialFactory(organization=self.organization, contact_user=self.sharer)
        self.request = MaterialRequestFactory(material=self.material, assigned_to=self.sharer)
        self.url = reverse("material-request-detail", args=[self.request.id])
        self.material_request_data = model_to_dict(self.request)

        self.request2 = MaterialRequestFactory()

        self.organization.assign_member_perms(self.sharer)
        self.organization.assign_owner_perms(self.sharer)

        self.other_member = UserFactory()
        self.organization.members.add(self.other_member)
        self.organization.assign_member_perms(self.other_member)
        self.organization.assign_owner_perms(self.other_member)

        self.user_without_perms = UserFactory()

        self.admin = UserFactory()
        self.admin.is_staff = True

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
        url = reverse("material-request-detail", args=[self.request.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_request_fulfilled_closes_issues(self):
        # Make the request IN_FULFILLMENT, add an open issue, and
        # verify that has_issues reports it correctly
        self.request.status = "IN_FULFILLMENT"
        self.request.save()
        issue = MaterialRequestIssueFactory(material_request=self.request)

        self.request.refresh_from_db()
        self.assertTrue(self.request.has_issues)

        self.client.force_authenticate(user=self.sharer)

        self.material_request_data["status"] = "FULFILLED"

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.request.refresh_from_db()
        self.assertFalse(self.request.has_issues)
        issue.refresh_from_db()
        self.assertEqual(issue.status, "CLOSED")

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_FULFILLED")),
            1,
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_ISSUE_CLOSED")),
            1,
        )

    def test_put_request_from_sharer_updates_a_material_request(self):
        self.client.force_authenticate(user=self.sharer)

        sharer_org = OrganizationFactory()
        sharer_org.members.add(self.sharer)
        sharer_org.save()

        self.material_request_data["status"] = "APPROVED"
        self.material_request_data["executed_mta_attachment"] = AttachmentFactory(
            owned_by_org=sharer_org
        ).id

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_request = MaterialRequest.objects.get(pk=self.request.id)
        self.assertEqual(material_request.status, "APPROVED")

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_APPROVED")),
            1,
        )
        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="SHARER_MTA_ADDED")),
            1,
        )

    def test_patch_request_from_requester_adds_attachments(self):
        # Set up the material request to require both MTA and IRB
        self.request.material.mta_attachment = AttachmentFactory()
        self.request.material.needs_irb = True
        self.request.material.save()

        self.client.force_authenticate(user=self.request.requester)

        irb_attachment = AttachmentFactory(
            owned_by_user=self.request.requester, owned_by_org=None, attachment_type="IRB"
        )
        mta_attachment = AttachmentFactory(
            owned_by_user=self.request.requester, owned_by_org=None, attachment_type="SIGNED_MTA"
        )
        material_request_data = {
            "irb_attachment": irb_attachment.id,
            "requester_signed_mta_attachment": mta_attachment.id,
        }

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_request = MaterialRequest.objects.get(pk=self.request.id)
        self.assertEqual(material_request.irb_attachment, irb_attachment)
        self.assertEqual(
            material_request.irb_attachment.owned_by_org, self.request.material.organization
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUESTER_IRB_ADDED")),
            1,
        )

    def test_patch_request_from_requester_fails_without_MTA(self):
        # Set up the material request to require both MTA and IRB
        self.request.material.mta_attachment = AttachmentFactory()
        self.request.material.needs_irb = True
        self.request.material.save()

        self.client.force_authenticate(user=self.request.requester)

        irb_attachment = AttachmentFactory(
            owned_by_user=self.request.requester, owned_by_org=None, attachment_type="IRB"
        )
        material_request_data = {"irb_attachment": irb_attachment.id}

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_request_from_requester_fails_without_IRB(self):
        # Set up the material request to require both MTA and IRB
        self.request.material.mta_attachment = AttachmentFactory()
        self.request.material.needs_irb = True
        self.request.material.save()

        self.client.force_authenticate(user=self.request.requester)

        mta_attachment = AttachmentFactory(
            owned_by_user=self.request.requester, owned_by_org=None, attachment_type="SIGNED_MTA"
        )
        material_request_data = {"requester_signed_mta_attachment": mta_attachment.id}

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_address_triggers_info_notif(self):
        self.client.force_authenticate(user=self.request.requester)

        address = AddressFactory(user=self.request.requester)
        material_request_data = {"address": address.id}

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_request = MaterialRequest.objects.get(pk=self.request.id)
        self.assertEqual(material_request.address, address)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_SHARER_RECEIVED_INFO"
                )
            ),
            self.organization.members.count(),
        )

    def test_patch_request_from_requester_updates_all_docs(self):
        # Set up the material request to require both MTA and IRB
        self.request.material.mta_attachment = AttachmentFactory()
        self.request.material.needs_irb = True
        self.request.material.shipping_requirement = ShippingRequirementFactory(
            organization=self.organization
        )
        self.request.material.save()
        self.request.payment_method = None
        self.request.payment_method_notes = None
        self.request.save()

        self.client.force_authenticate(user=self.request.requester)

        mta_attachment = AttachmentFactory(
            owned_by_user=self.request.requester, owned_by_org=None, attachment_type="SIGNED_MTA"
        )

        irb_attachment = AttachmentFactory(
            owned_by_user=self.request.requester, owned_by_org=None, attachment_type="IRB"
        )

        material_request_data = {
            "payment_method": "REIMBURSEMENT",
            "payment_method_notes": "You know I'm good for it!",
            "irb_attachment": irb_attachment.id,
            "requester_signed_mta_attachment": mta_attachment.id,
        }

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUESTER_PAYMENT_METHOD_ADDED")),
            1,
        )

        self.assertEqual(
            len(
                MaterialShareEvent.objects.filter(event_type="REQUESTER_PAYMENT_METHOD_NOTES_ADDED")
            ),
            1,
        )

        # Test that this is idempotent. If multiple requests happen they shouldn't be an error.
        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_request_from_requester_missing_payment_fails(self):
        # Set up the material request to require both MTA and IRB
        self.request.material.mta_attachment = AttachmentFactory()
        self.request.material.needs_irb = True
        self.request.material.shipping_requirement = ShippingRequirementFactory(
            organization=self.organization
        )
        self.request.material.save()
        self.request.payment_method = None
        self.request.payment_method_notes = None
        self.request.irb_attachment = None
        self.request.requester_signed_mta_attachment = None
        self.request.save()

        self.client.force_authenticate(user=self.request.requester)

        mta_attachment = AttachmentFactory(
            owned_by_user=self.request.requester, owned_by_org=None, attachment_type="SIGNED_MTA"
        )

        irb_attachment = AttachmentFactory(
            owned_by_user=self.request.requester, owned_by_org=None, attachment_type="IRB"
        )

        material_request_data = {
            "irb_attachment": irb_attachment.id,
            "requester_signed_mta_attachment": mta_attachment.id,
        }

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # There was a bug where we were updating the request even
        # though it was missing docs, so test that it doesn't get
        # updated.
        self.request.refresh_from_db()
        self.assertIsNone(self.request.irb_attachment)

    def test_patch_request_from_requester_generates_payment_events(self):
        self.client.force_authenticate(user=self.request.requester)

        material_request_data = {
            "payment_method": "REIMBURSEMENT",
            "payment_method_notes": "You know I'm good for it!",
        }

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUESTER_PAYMENT_METHOD_ADDED")),
            1,
        )

        self.assertEqual(
            len(
                MaterialShareEvent.objects.filter(event_type="REQUESTER_PAYMENT_METHOD_NOTES_ADDED")
            ),
            1,
        )

    def test_put_request_from_requester_verifies_request(self):
        # Make the request fulfilled, so it can be verified.
        self.request.status = "FULFILLED"
        self.request.save()

        self.client.force_authenticate(user=self.request.requester)

        self.material_request_data["status"] = "VERIFIED_FULFILLED"

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        material_request = MaterialRequest.objects.get(pk=self.request.id)
        self.assertEqual(material_request.status, "VERIFIED_FULFILLED")

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_VERIFIED_FULFILLED")),
            1,
        )

    def test_put_request_from_sharer_does_not_verify_request(self):
        # Make the request fulfilled, so it could be verified.
        self.request.status = "FULFILLED"
        self.request.save()

        self.client.force_authenticate(user=self.sharer)

        self.material_request_data["status"] = "VERIFIED_FULFILLED"

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_user_who_does_not_own_attachment_fails(self):
        self.client.force_authenticate(user=self.request.requester)

        irb_attachment = AttachmentFactory()

        self.material_request_data["irb_attachment"] = irb_attachment.id

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_updates_assigned_to(self):
        self.client.force_authenticate(user=self.other_member)
        self.material_request_data["assigned_to"] = self.other_member.id

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated_request = MaterialRequest.objects.get(id=self.request.id)
        self.assertEqual(updated_request.assigned_to, self.other_member)

        personal_notifications = Notification.objects.filter(
            notification_type="MATERIAL_REQUEST_SHARER_ASSIGNED"
        )
        self.assertEqual(personal_notifications[0].associated_user, self.other_member)
        self.assertEqual(personal_notifications.count(), 1)

        self.assertEqual(
            len(
                Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_ASSIGNMENT")
            ),
            self.organization.members.count() - 1,
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_REASSIGNED")),
            1,
        )

    def test_put_request_from_requester_does_not_update_assigned_to(self):
        self.client.force_authenticate(user=self.request.requester)
        self.material_request_data["assigned_to"] = self.other_member.id

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_can_reject(self):
        self.client.force_authenticate(user=self.sharer)

        material_request_data = {"status": "REJECTED"}

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_REJECTED")),
            self.organization.members.count(),
        )
        self.assertEqual(
            len(
                Notification.objects.filter(notification_type="MATERIAL_REQUEST_REQUESTER_REJECTED")
            ),
            1,
        )

    def test_patch_can_cancel(self):
        self.client.force_authenticate(user=self.request.requester)

        material_request_data = {"status": "CANCELLED"}

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(Notification.objects.filter(notification_type="MATERIAL_REQUEST_SHARER_CANCELLED")),
            self.organization.members.count(),
        )
        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_REQUESTER_CANCELLED"
                )
            ),
            1,
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_CANCELLED")),
            1,
        )

    def test_patch_can_move_to_in_fulfillment(self):
        # Remove the executed MTA so we can test the IN_FULFILLMENT notifications.
        self.request.executed_mta_attachment = None
        self.request.save()

        self.client.force_authenticate(user=self.sharer)

        material_request_data = {"status": "IN_FULFILLMENT"}

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_SHARER_IN_FULFILLMENT"
                )
            ),
            self.organization.members.count(),
        )
        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT"
                )
            ),
            1,
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_IN_FULFILLMENT")),
            1,
        )

    def test_patch_requester_can_move_to_in_fulfillment(self):
        """If an MTA is not required, the requester can move it to IN_FULFILLMENT"""
        self.material.mta_attachment = None
        self.material.save()
        # Remove the executed MTA so we can test the IN_FULFILLMENT notifications.
        self.request.executed_mta_attachment = None
        self.request.status = "APPROVED"
        self.request.save()
        self.client.force_authenticate(user=self.request.requester)

        irb_attachment = AttachmentFactory(owned_by_user=self.request.requester)
        material_request_data = {"status": "IN_FULFILLMENT", "irb_attachment": irb_attachment.id}

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_SHARER_IN_FULFILLMENT"
                )
            ),
            self.organization.members.count(),
        )
        self.assertEqual(
            len(
                Notification.objects.filter(
                    notification_type="MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT"
                )
            ),
            1,
        )

        self.assertEqual(
            len(MaterialShareEvent.objects.filter(event_type="REQUEST_IN_FULFILLMENT")),
            1,
        )

    def test_patch_requester_cannot_move_to_in_fulfillment(self):
        """If an MTA is required, the requester cannot move it to IN_FULFILLMENT"""
        self.client.force_authenticate(user=self.request.requester)

        irb_attachment = AttachmentFactory()
        material_request_data = {"status": "IN_FULFILLMENT", "irb_attachment": irb_attachment.id}

        response = self.client.patch(self.url, material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)

        self.material_request_data["status"] = "APPROVED"

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)

        self.material_request_data["status"] = "APPROVED"

        response = self.client.put(self.url, self.material_request_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_request_deletes_a_material(self):
        self.client.force_authenticate(user=self.admin)
        request_id = self.request.id
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(MaterialRequest.objects.filter(id=request_id).count(), 0)

    def test_delete_request_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_request_from_unauthenticated_forbidden(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestNestedMaterialRequestListTestCase(APITestCase):
    """
    Tests /materials/id/requests list operations.
    """

    def setUp(self):
        self.request = MaterialRequestFactory()
        self.url = reverse("material-material-requests-list", args=[self.request.material.id])

        self.sharer = self.request.material.contact_user
        self.organization = self.request.material.organization
        self.request.material.save()

        # Create second material for same user to make sure nesting filters correctly.
        material = MaterialFactory(organization=self.organization)
        MaterialRequestFactory(material=material)

        self.organization.members.add(self.sharer)
        self.organization.assign_member_perms(self.sharer)
        self.organization.assign_owner_perms(self.sharer)

        self.material_request_data = model_to_dict(self.request)

        self.user_without_perms = UserFactory()

    def test_get_request_from_sharer_succeeds(self):
        self.client.force_authenticate(user=self.sharer)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_from_sharer_filters_fields(self):
        self.client.force_authenticate(user=self.sharer)
        response = self.client.get(self.url + "?status=OPEN")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_from_sharer_filters_fields_out(self):
        self.client.force_authenticate(user=self.sharer)
        response = self.client.get(self.url + "?status=APPROVED")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 0)

    def test_get_request_from_requester_succeeds(self):
        self.client.force_authenticate(user=self.request.requester)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_get_request_filters(self):
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 0)

    def test_get_request_from_unauthenticated_fails(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
