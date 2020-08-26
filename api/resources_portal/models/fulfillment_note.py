from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.material_request import MaterialRequest
from resources_portal.models.user import User


class FulfillmentNote(SafeDeleteModel):
    class Meta:
        db_table = "fulfillment_notes"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="+"
    )

    material_request = models.ForeignKey(
        MaterialRequest,
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="fulfillment_notes",
    )

    text = models.TextField(blank=False, null=False)
