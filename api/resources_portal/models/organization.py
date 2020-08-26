from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from guardian.shortcuts import assign_perm, remove_perm
from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.organization_user_setting import OrganizationUserSetting
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


class Organization(SafeDeleteModel):
    class Meta:
        db_table = "organizations"
        get_latest_by = "updated_at"
        ordering = ["updated_at", "id"]

        permissions = OWNER_PERMISSIONS + MEMBER_PERMISSIONS

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    name = models.TextField(blank=False, null=False, help_text="The name of the organization.")

    owner = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="owned_organizations"
    )

    members = models.ManyToManyField(User, through="OrganizationUserAssociation")
    grants = models.ManyToManyField("Grant", through="GrantOrganizationAssociation")

    @property
    def frontend_URL(self):
        return f"https://{settings.AWS_SES_DOMAIN}/account/teams/{self.id}"

    def assign_owner_perms(self, user):
        for permission in OWNER_PERMISSIONS:
            assign_perm(permission[0], user, self)

    def remove_owner_perms(self, user):
        for permission in OWNER_PERMISSIONS:
            remove_perm(permission[0], user, self)

    def assign_member_perms(self, user):
        for permission in MEMBER_PERMISSIONS:
            assign_perm(permission[0], user, self)

    def remove_member_perms(self, user):
        for permission in MEMBER_PERMISSIONS:
            remove_perm(permission[0], user, self)


@receiver(post_save, sender="resources_portal.Organization")
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        # when a new organization is created, assign permission to it's owner
        instance.assign_member_perms(instance.owner)
        instance.assign_owner_perms(instance.owner)


@receiver(post_save, sender="resources_portal.Organization")
def create_owner_settings(sender, instance=None, created=False, **kwargs):
    if created:
        OrganizationUserSetting.objects.get_or_create(user=instance.owner, organization=instance)
