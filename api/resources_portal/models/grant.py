from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel


class Grant(SafeDeleteModel):
    class Meta:
        db_table = "grants"
        get_latest_by = "created_at"
        ordering = ["created_at"]

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    title = models.TextField()
    funder_id = models.CharField(max_length=80)

    users = models.ManyToManyField("User", through="GrantUserAssociation")
    organizations = models.ManyToManyField("Organization", through="GrantOrganizationAssociation")
    materials = models.ManyToManyField("Material", through="GrantMaterialAssociation")
