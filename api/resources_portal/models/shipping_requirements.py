from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel


class ShippingRequirements(SafeDeleteModel):
    class Meta:
        db_table = "shipping_requirements"
        get_latest_by = "updated_at"
        ordering = ["updated_at"]

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    needs_shipping_address = models.BooleanField(default=False)
    needs_payment = models.BooleanField(default=False)

    accepts_shipping_code = models.BooleanField(default=False)
    accepts_reimbursement = models.BooleanField(default=False)
    accepts_other_payment_methods = models.BooleanField(default=False)

    restrictions = models.TextField(blank=True, null=True)

    is_deleted = models.BooleanField(default=False)
