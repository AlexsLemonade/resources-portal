from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from guardian.shortcuts import assign_perm, remove_perm

from resources_portal.models.user import User

OWNER_PERMISSIONS = (
    ("delete_resources", "delete_resources"),
    ("add_members", "add_members"),
    ("manage_permissions", "manage_permissions"),
    ("add_owner", "add_owner"),
    ("remove_members", "remove_members"),
)

MEMBER_PERMISSIONS = (
    ("add_resources", "add_resources"),
    ("edit_resources", "edit_resources"),
    ("archive_resources", "archive_resources"),
    ("view_requests", "view_requests"),
    ("approve_requests", "approve_requests"),
)


class Organization(models.Model):
    class Meta:
        db_table = "organizations"
        get_latest_by = "updated_at"

        permissions = OWNER_PERMISSIONS + MEMBER_PERMISSIONS

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    name = models.TextField(blank=False, null=False, help_text="The name of the organization.")

    owner = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="owned_organizations"
    )

    members = models.ManyToManyField(User, through="OrganizationUserAssociation")
    grants = models.ManyToManyField("Grant", through="GrantOrganizationAssociation")


def assign_owner_perms(user, organization):
    for permission in OWNER_PERMISSIONS:
        assign_perm(permission[0], user, organization)


def remove_owner_perms(user, organization):
    for permission in OWNER_PERMISSIONS:
        remove_perm(permission[0], user, organization)


def assign_member_perms(user, organization):
    for permission in MEMBER_PERMISSIONS:
        assign_perm(permission[0], user, organization)


def remove_member_perms(user, organization):
    for permission in MEMBER_PERMISSIONS:
        remove_perm(permission[0], user, organization)


@receiver(post_save, sender="resources_portal.Organization")
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        # when a new organization is created, assign permission to it's owner
        assign_member_perms(instance.owner, instance)
        assign_owner_perms(instance.owner, instance)
