from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.material import Material
from resources_portal.models.user import User


class MaterialShareEvent(SafeDeleteModel):
    class Meta:
        db_table = "material_share_events"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    material = models.ForeignKey(
        Material, blank=False, null=False, on_delete=models.CASCADE, related_name="share_events"
    )

    EVENT_TYPES = (
        ("REQUEST_REJECTED", "REQUEST_REJECTED"),
        ("REQUEST_CANCELLED", "REQUEST_CANCELLED"),
        ("REQUEST_ACCEPTED", "REQUEST_ACCEPTED"),
        ("REQUESTER_IRB_ADDED", "REQUESTER_IRB_ADDED"),
        ("REQUESER_MTA_ADDED", "REQUESER_MTA_ADDED"),
        ("REQUESTER_PAYMENT_METHOD_ADDED", "REQUESTER_PAYMENT_METHOD_ADDED"),
        ("REQUESTER_PAYMENT_NOTES_ADDED", "REQUESTER_PAYMENT_NOTES_ADDED"),
        ("SHARER_MTA_ADDED", "SHARER_MTA_ADDED"),
        ("REQUEST_IN_FULFILLMENT", "REQUEST_IN_FULFILLMENT"),
        ("REQUEST_FULFILLED", "REQUEST_FULFILLED"),
        ("REQUEST_VERIFIED_FULFILLED", "REQUEST_VERIFIED_FULFILLED"),
        ("REQUEST_FULFILLMENT_NOTE_ADDED", "REQUEST_FULFILLMENT_NOTE_ADDED"),
        ("REQUEST_REASSIGNED", "REQUEST_REASSIGNED"),
        ("REQUEST_ISSUE_OPENED", "REQUEST_ISSUE_OPENED"),
        ("REQUEST_ISSUE_CLOSED", "REQUEST_ISSUE_CLOSED"),
        ("MATERIAL_MTA_REQUIREMENTS_CHANGED", "MATERIAL_MTA_REQUIREMENTS_CHANGED"),
        ("MATERIAL_IRB_REQUIREMENTS_CHANGED", "MATERIAL_IRB_REQUIREMENTS_CHANGED"),
        ("MATERIAL_SHIPPING_REQUIREMENTS_CHANGED", "MATERIAL_SHIPPING_REQUIREMENTS_CHANGED"),
    )
    event_type = models.CharField(max_length=255, blank=True, null=True, choices=EVENT_TYPES)

    created_by = models.ForeignKey(
        User,
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="material_share_events",
    )

    assigned_to = models.ForeignKey(
        User,
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="material_share_assignments",
    )
