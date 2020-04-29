from django.db import models

from resources_portal.models.organization import Organization
from resources_portal.models.user import User


class OrganizationInvitation(models.Model):
    """ This model will store information on invitations to join an organization and requests to join an organization """

    class Meta:
        db_table = "organization_invitations"
        get_latest_by = "updated_at"

        permissions = (
            ("add_members_and_manage_permissions", "Can add members and manage their permissions"),
        )

    STATUS_CHOICES = (
        ("PENDING", "PENDING"),
        ("ACCEPTED", "ACCEPTED"),
        ("REJECTED", "REJECTED"),
        ("INVALID", "INVALID"),
    )

    INVITE_OR_REQUEST_CHOICES = (("INVITE", "INVITE"), ("REQUEST", "REQUEST"))

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    requester = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="invitations"
    )
    request_reciever = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        Organization, blank=False, null=False, on_delete=models.CASCADE
    )

    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="PENDING")
    invite_or_request = models.CharField(
        max_length=32, choices=INVITE_OR_REQUEST_CHOICES, default="INVITE"
    )
