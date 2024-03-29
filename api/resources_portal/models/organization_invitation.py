from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.organization import Organization
from resources_portal.models.user import User


class OrganizationInvitation(SafeDeleteModel):
    """This model will store information on invitations to join an organization and requests to join an organization"""

    class Meta:
        db_table = "organization_invitations"
        get_latest_by = "updated_at"
        ordering = ["updated_at", "id"]

    STATUS_CHOICES = (
        ("PENDING", "PENDING"),
        ("ACCEPTED", "ACCEPTED"),
        ("REJECTED", "REJECTED"),
        ("INVALID", "INVALID"),
    )

    INVITE_OR_REQUEST_CHOICES = (("INVITE", "INVITE"), ("REQUEST", "REQUEST"))

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    requester = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="invitations"
    )
    request_receiver = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        Organization, blank=False, null=False, on_delete=models.CASCADE
    )

    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="PENDING")
    invite_or_request = models.CharField(
        max_length=32, choices=INVITE_OR_REQUEST_CHOICES, default="INVITE"
    )
