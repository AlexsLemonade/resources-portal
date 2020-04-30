from django.db import models


class ShippingInformation(models.Model):
    class Meta:
        db_table = "shipping_information"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    needs_shipping_address = models.BooleanField(default=False)
    sharer_pays = models.BooleanField(default=False)

    ups_code_accepted = models.BooleanField(default=False)
    fedex_code_accepted = models.BooleanField(default=False)
    reimbursement_accepted = models.BooleanField(default=False)
    other_payment_methods_accepted = models.BooleanField(default=False)

    restrictions = models.TextField(blank=True, null=True)

    deleted = models.BooleanField(default=False)
