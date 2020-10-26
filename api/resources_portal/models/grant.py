from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.associations.grant_organization_association import (
    GrantOrganizationAssociation,
)


class Grant(SafeDeleteModel):
    class Meta:
        db_table = "grants"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    title = models.TextField()
    funder_id = models.CharField(max_length=80)

    user = models.ForeignKey(
        "User", blank=True, null=True, on_delete=models.SET_NULL, related_name="grants"
    )
    organizations = models.ManyToManyField("Organization", through="GrantOrganizationAssociation")
    materials = models.ManyToManyField("Material", through="GrantMaterialAssociation")

    def set_on_personal_organization(self):
        if self.user and self.user.personal_organization:
            GrantOrganizationAssociation.objects.get_or_create(
                grant=self, organization=self.user.personal_organization
            )

    def save(self, *args, **kwargs):
        """Keep the user's personal organization synced up.

        Because we don't want the users to have to manage grant
        relationships with their organizations, we want their personal
        organization's grant list to stay in sync with their user's
        grant list.
        """
        original = None
        if self.id:
            original = Grant.objects.get(pk=self.id)

        super().save(*args, **kwargs)

        if original:
            if original.user != self.user:
                # Grant user is changing, need to keep relationships
                # with the personal organizations in sync.

                # First remove the old association, if there was one.
                if original.user and original.user.personal_organization:
                    old_association = GrantOrganizationAssociation.objects.filter(
                        grant=self, organization=original.user.personal_organization
                    ).first()
                    if old_association:
                        old_association.delete()

                # Then add the new association, if there's still an
                # organization to add it to.
                self.set_on_personal_organization()
        else:
            # This was just created, make sure the personal
            # organization of user is linked if they both exist.
            self.set_on_personal_organization()
