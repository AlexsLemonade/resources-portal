from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel


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
