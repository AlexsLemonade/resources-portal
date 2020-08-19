from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.address import Address
from resources_portal.models.attachment import Attachment
from resources_portal.models.material import Material
from resources_portal.models.user import User


class MaterialRequest(SafeDeleteModel):
    class Meta:
        db_table = "material_requests"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    STATUS_CHOICES = (
        ("OPEN", "OPEN"),
        ("APPROVED", "APPROVED"),
        ("REJECTED", "REJECTED"),
        ("INVALID", "INVALID"),
        ("CANCELLED", "CANCELLED"),
        ("FULFILLED", "FULFILLED"),
        ("VERIFIED_FULFILLED", "VERIFIED_FULFILLED"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    material = models.ForeignKey(
        Material, blank=False, null=False, on_delete=models.CASCADE, related_name="requests"
    )

    address = models.ForeignKey(
        Address, blank=False, null=True, on_delete=models.SET_NULL, related_name="requests"
    )

    requester = models.ForeignKey(
        User, blank=False, null=False, on_delete=models.CASCADE, related_name="material_requests"
    )

    requester_signed_mta_attachment = models.ForeignKey(
        Attachment,
        blank=False,
        null=True,
        on_delete=models.SET_NULL,
        related_name="requests_signed_mta",
    )
    irb_attachment = models.ForeignKey(
        Attachment, blank=False, null=True, on_delete=models.SET_NULL, related_name="requests_irb"
    )
    executed_mta_attachment = models.ForeignKey(
        Attachment,
        blank=False,
        null=True,
        on_delete=models.SET_NULL,
        related_name="requests_executed_mta",
        help_text="Attachment containing the MTA after it has been signed by all parties.",
    )

    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="OPEN")

    assigned_to = models.ForeignKey(
        User, blank=False, null=True, on_delete=models.CASCADE, related_name="assignments"
    )

    @property
    def is_active(self):
        return self.status in ["OPEN", "APPROVED", "IN_FULFILLMENT"]

    @property
    def requires_action_sharer(self):
        # Coming next!
        return True

    @property
    def requires_action_requester(self):
        if self.status != "APPROVED":
            return False

        missing_irb = self.material.needs_irb and self.irb_attachment is None
        missing_mta = (
            self.material.mta_attachment is not None
            and self.requester_signed_mta_attachment is None
        )
        return missing_irb or missing_mta

    # Sharer:
    # requires actions
    # you are sharer you are assigned request and not awaiting additional documents
    # Requester:
    # when status is awaiting additional documents

    def save(self, *args, **kwargs):
        if self.assigned_to is None:
            self.assigned_to = self.material.contact_user
        super().save(*args, **kwargs)
