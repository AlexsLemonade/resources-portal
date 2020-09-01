from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework.test import APITestCase

from faker import Faker

from resources_portal.models import Notification
from resources_portal.models.notifications_config import NOTIFICATIONS
from resources_portal.test.factories import (
    GrantFactory,
    MaterialFactory,
    MaterialRequestFactory,
    MaterialRequestIssueFactory,
    OrganizationFactory,
    UserFactory,
)

fake = Faker()


class TestMaterialListTestCase(APITestCase):
    """
    Tests /materials list operations.
    """

    def setUp(self):
        self.url = reverse("material-list")
        self.user = UserFactory(receive_non_assigned_notifs=True)
        self.organization = OrganizationFactory(owner=self.user)
        self.grant = GrantFactory()
        self.material = MaterialFactory(contact_user=self.user, organization=self.organization)
        self.material_request = MaterialRequestFactory(material=self.material)
        self.material_request_issue = MaterialRequestIssueFactory(
            material_request=self.material_request
        )
        self.notification = Notification(
            notification_type="MATERIAL_REQUEST_SHARER_ASSIGNED_NEW",
            notified_user=self.user,
            associated_user=self.user,
            associated_organization=self.organization,
            associated_grant=self.grant,
            associated_material=self.material,
            associated_material_request=self.material_request,
            associated_material_request_issue=self.material_request_issue,
        )

    def test_all_notification_type_formatting(self):
        for notification_type in NOTIFICATIONS.keys():
            self.notification.notification_type = notification_type
            self.notification.delivered = False
            self.notification.save()
            email_dict = self.notification.get_email_dict()

            # We formtat the html different than the other fields.
            self.assertNotIn("REPLACE_", email_dict.pop("formatted_html"))

            for _, formatted_text in email_dict.items():
                self.assertNotIn("{", formatted_text)
                self.assertNotIn("}", formatted_text)

    def test_missing_required_field_errors(self):
        with self.assertRaises(ValidationError):
            self.notification.notification_type = "MATERIAL_ADDED"
            self.notification.associated_material = None
            self.notification.save()

    def test_missing_non_required_field_ok(self):
        self.notification.notification_type = "ORGANIZATION_NEW_MEMBER"
        self.notification.associated_material = None
        self.notification.save()

        # Lack of exception means it was ok!
