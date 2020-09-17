from django.conf import settings
from django.db import models

from computedfields.models import ComputedFieldsModel, computed
from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.address import Address
from resources_portal.models.attachment import Attachment
from resources_portal.models.material import Material
from resources_portal.models.user import User


class MaterialRequest(SafeDeleteModel, ComputedFieldsModel):
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
        ("IN_FULFILLMENT", "IN_FULFILLMENT"),
        ("FULFILLED", "FULFILLED"),
        ("VERIFIED_FULFILLED", "VERIFIED_FULFILLED"),
        ("REJECTED", "REJECTED"),
        ("INVALID", "INVALID"),
        ("CANCELLED", "CANCELLED"),
    )
    PAYMENT_METHOD_CHOICES = (
        ("SHIPPING_CODE", "SHIPPING_CODE"),
        ("REIMBURSMENT", "REIMBURSMENT"),
        ("OTHER_PAYMENT_METHODS", "OTHER_PAYMENT_METHODS"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    material = models.ForeignKey(
        Material, blank=False, null=False, on_delete=models.CASCADE, related_name="requests"
    )

    address = models.OneToOneField(
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

    rejection_reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="OPEN")
    payment_method = models.CharField(
        max_length=32, blank=False, null=True, choices=PAYMENT_METHOD_CHOICES
    )
    payment_method_notes = models.TextField(blank=False, null=True)
    requester_abstract = models.TextField(blank=True, null=True)

    assigned_to = models.ForeignKey(
        User, blank=False, null=True, on_delete=models.CASCADE, related_name="assignments"
    )

    @computed(models.BooleanField(blank=False, null=True))
    def is_active(self):
        return self.status in ["OPEN", "APPROVED", "IN_FULFILLMENT", "FULFILLED"]

    @property
    def is_missing_requester_documents(self):
        missing_irb = self.material.needs_irb and self.irb_attachment is None
        missing_mta = (
            self.material.mta_attachment is not None
            and self.requester_signed_mta_attachment is None
        )
        return missing_irb or missing_mta or self.needs_shipping_info()

    @property
    def requires_action_sharer(self):
        if not self.is_active:
            return False

        if self.status == "APPROVED":
            return not self.requires_action_requester
        else:
            return True

    @property
    def requires_action_requester(self):
        if self.status != "APPROVED":
            return False

        return self.is_missing_requester_documents

    @property
    def has_issues(self):
        return self.issues.filter(status="OPEN").count() > 0

    @property
    def frontend_URL(self):
        return f"https://{settings.AWS_SES_DOMAIN}/account/requests/{self.id}"

    def needs_shipping_info(self):
        shipping_requirement = self.material.shipping_requirement
        if shipping_requirement:
            if shipping_requirement.needs_shipping_address and not self.address:
                return True
            elif shipping_requirement.needs_payment and not self.payment_method:
                return True

        return False

    @property
    def required_info_plain_text(self):
        required_info = ""
        if self.material.mta_attachment and not self.requester_signed_mta_attachment:
            required_info += "- Signed MTA\n"
        if self.material.needs_irb and not self.irb_attachment:
            required_info += "- IRB Approval\n"

        if self.needs_shipping_info():
            required_info += "- Shipping Information\n"

        return required_info

    @property
    def provided_info_plain_text(self):
        provided_info = ""
        if self.requester_signed_mta_attachment:
            provided_info += "- Signed MTA\n"
        if not self.irb_attachment:
            provided_info += "- IRB Approval\n"
        if self.address or self.payment_method:
            provided_info += "- Shipping Information\n"

    @property
    def required_info_html(self):
        required_info = "<list>"
        if self.material.mta_attachment and not self.requester_signed_mta_attachment:
            required_info += "<ul>Signed MTA</ul>"
        if self.material.needs_irb and not self.irb_attachment:
            required_info += "<ul>IRB Approval</ul>"
        if self.needs_shipping_info():
            required_info += "<ul>Shipping Information</ul>"

        required_info += "</list>"
        return required_info

    @property
    def provided_info_html(self):
        provided_info = "<list>"
        if self.requester_signed_mta_attachment:
            provided_info += "<ul>Signed MTA</ul>"
        if not self.irb_attachment:
            provided_info += "<ul>IRB Approval</ul>"
        if self.address or self.payment_method:
            provided_info += "<ul>Shipping Information</ul>"

        provided_info += "</list>"
        return provided_info

    def save(self, *args, **kwargs):
        if self.assigned_to is None:
            self.assigned_to = self.material.contact_user
        super().save(*args, **kwargs)
