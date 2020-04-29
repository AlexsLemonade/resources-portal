from django.db import models


class ShippingInformation(models.Model):
    class Meta:
        db_table = "shipping_information"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    shipping_address = models.BooleanField(default=False)
    sharer_pays = models.BooleanField(default=False)

    PAYMENT_CHOICES = (
        ("UPS_CODE", "UPS_CODE"),
        ("FEDEX_CODE", "FEDEX_CODE"),
        ("REIMBURSEMENT", "REIMBURSEMENT"),
        ("OTHER", "OTHER"),
    )
    payment_method = models.CharField(null=True, max_length=32, choices=PAYMENT_CHOICES)

    restrictions = models.TextField(blank=True, null=True)

    deleted = models.BooleanField(default=False)
