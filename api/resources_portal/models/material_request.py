from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.attachment import Attachment
from resources_portal.models.material import Material
from resources_portal.models.user import User


class MaterialRequest(SafeDeleteModel):
    class Meta:
        db_table = "material_requests"
        get_latest_by = "created_at"

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    STATUS_CHOICES = (
        ("PENDING", "PENDING"),
        ("APPROVED", "APPROVED"),
        ("REJECTED", "REJECTED"),
        ("INVALID", "INVALID"),
        ("CANCELLED", "CANCELLED"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    material = models.ForeignKey(
        Material, blank=False, null=False, on_delete=models.CASCADE, related_name="requests"
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

    is_active = models.BooleanField(default=True)

    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="PENDING")

    assigned_to = models.ForeignKey(
        User, blank=False, null=True, on_delete=models.CASCADE, related_name="assignments"
    )

    def save(self, *args, **kwargs):
        if self.assigned_to == None:
            self.assigned_to = self.material.contact_user
        super().save(*args, **kwargs)
