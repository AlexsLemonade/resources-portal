from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from guardian.shortcuts import assign_perm

from resources_portal.models.user import User


class Organization(models.Model):
    class Meta:
        db_table = "organizations"
        get_latest_by = "updated_at"

        permissions = (
            ("add_resources", "add_resources"),
            ("add_members_and_manage_permissions", "add_members_and_manage_permissions"),
            ("approve_requests", "approve_requests"),
        )

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    name = models.TextField(blank=False, null=False, help_text="The name of the organization.")

    owner = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="owned_organizations"
    )

    members = models.ManyToManyField(User, through="OrganizationUserAssociation")
    grants = models.ManyToManyField("Grant", through="GrantOrganizationAssociation")


@receiver(post_save, sender="resources_portal.Organization")
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        # when a new organization is created, assign permission to it's owner
        assign_perm("approve_requests", instance.owner, instance)
