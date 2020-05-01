from django.db import models


class ShippingRequirements(models.Model):
    class Meta:
        db_table = "shipping_requirements"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    needs_shipping_address = models.BooleanField(default=False)
    sharer_pays = models.BooleanField(default=False)

    accepts_ups_code = models.BooleanField(default=False)
    accepts_fedex_code = models.BooleanField(default=False)
    accepts_reimbursement = models.BooleanField(default=False)
    accepts_other_payment_methods = models.BooleanField(default=False)

    restrictions = models.TextField(blank=True, null=True)

    is_deleted = models.BooleanField(default=False)
