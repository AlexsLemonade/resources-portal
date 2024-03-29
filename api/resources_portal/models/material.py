from django.conf import settings
from django.contrib.postgres.fields import ArrayField, JSONField
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.attachment import Attachment
from resources_portal.models.shipping_requirement import ShippingRequirement
from resources_portal.models.user import User


class Material(SafeDeleteModel):
    class Meta:
        db_table = "materials"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    CATEGORY_CHOICES = (
        ("CELL_LINE", "CELL_LINE"),
        ("PLASMID", "PLASMID"),
        ("PROTOCOL", "PROTOCOL"),
        ("DATASET", "DATASET"),
        ("MODEL_ORGANISM", "MODEL_ORGANISM"),
        ("PDX", "PDX"),
        ("OTHER", "OTHER"),
    )

    IMPORTED_CHOICES = (
        ("GEO", "GEO"),
        ("SRA", "SRA"),
        ("DBGAP", "DBGAP"),
        ("DATASET", "DATASET"),
        ("PROTOCOLS_IO", "PROTOCOLS_IO"),
        ("ADDGENE", "ADDGENE"),
        ("JACKSON_LABS", "JACKSON_LABS"),
        ("ATCC", "ATCC"),
        ("ZIRC", "ZIRC"),
        ("OTHER", "OTHER"),
    )

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES)
    url = models.TextField(blank=True, null=True)
    pubmed_id = models.CharField(max_length=32, blank=True)

    additional_metadata = JSONField(default=dict)

    mta_attachment = models.ForeignKey(
        Attachment, blank=False, null=True, on_delete=models.SET_NULL, related_name="mta_materials"
    )

    title = models.TextField(blank=False, null=False, help_text="The title of the material.")

    needs_irb = models.BooleanField(default=False, null=True)
    needs_abstract = models.BooleanField(default=False, null=True)
    imported = models.BooleanField(default=False, null=False)
    shipping_requirement = models.OneToOneField(
        ShippingRequirement, blank=False, null=True, on_delete=models.deletion.SET_NULL
    )

    import_source = models.CharField(max_length=32, null=True, choices=IMPORTED_CHOICES)

    contact_user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        "Organization", blank=False, null=False, on_delete=models.CASCADE, related_name="materials"
    )

    grants = models.ManyToManyField("Grant", through="GrantMaterialAssociation")

    organisms = ArrayField(base_field=models.TextField(), blank=True, null=True)
    publication_title = models.TextField(blank=True, null=True)
    pre_print_doi = models.TextField(blank=True, null=True)
    pre_print_title = models.TextField(blank=True, null=True)
    citation = models.TextField(blank=True, null=True)
    additional_info = models.TextField(blank=True, null=True)
    embargo_date = models.DateField(blank=True, null=True)

    is_archived = models.BooleanField(default=False, null=False)

    @property
    def needs_mta(self):
        return not (self.mta_attachment is None)

    def has_publication(self):
        return not (self.pubmed_id == "")

    def has_pre_print(self):
        return bool(self.pre_print_doi and self.pre_print_title)

    @property
    def frontend_URL(self):
        return f"https://{settings.AWS_SES_DOMAIN}{self.frontend_path}"

    @property
    def frontend_path(self):
        return f"/resources/{self.id}"


@receiver(post_save, sender="resources_portal.Material")
def fix_attachment_organizations(
    sender, instance=None, created=False, update_fields=None, **kwargs
):
    """If the organziation changes, update the attachment."""
    if created or not instance:
        # Nothing to do during creation.
        return

    attachments_needing_update = instance.sequence_maps.exclude(owned_by_org=instance.organization)
    if attachments_needing_update.count() > 0:
        for attachment in attachments_needing_update.all():
            attachment.owned_by_org = instance.organization
            attachment.save()

    if (
        instance.mta_attachment
        and instance.mta_attachment.owned_by_org
        and instance.mta_attachment.owned_by_org != instance.organization
    ):
        instance.mta_attachment.owned_by_org = instance.organization
        instance.mta_attachment.save()
