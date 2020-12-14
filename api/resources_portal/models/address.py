from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.user import User


class Address(SafeDeleteModel):
    class Meta:
        db_table = "address"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    user = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="addresses"
    )
    saved_for_reuse = models.BooleanField(default=False, null=False)

    name = models.TextField(blank=False, null=False)
    institution = models.TextField(blank=False, null=False)
    address_line_1 = models.TextField(blank=False, null=False)
    address_line_2 = models.TextField(blank=False, null=True)
    locality = models.TextField(blank=False, null=False)
    postal_code = models.TextField(blank=False, null=True)
    state = models.TextField(blank=False, null=False)
    country = models.TextField(blank=False, null=False)
