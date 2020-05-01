from django.contrib.postgres.fields import ArrayField, JSONField
from django.db import models

from resources_portal.models.attachment import Attachment
from resources_portal.models.user import User


class Material(models.Model):
    class Meta:
        db_table = "materials"
        get_latest_by = "created_at"

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
        ("JACKSON_LAB", "JACKSON_LAB"),
        ("ATCC", "ATCC"),
        ("ZIRC", "ZIRC"),
        ("OTHER", "OTHER"),
    )

    objects = models.Manager()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    title = models.TextField()
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES)
    url = models.TextField(blank=True, null=True)
    pubmed_id = models.CharField(max_length=32, blank=True)

    additional_metadata = JSONField(default=dict)

    mta_attachment = models.ForeignKey(
        Attachment, blank=False, null=True, on_delete=models.SET_NULL, related_name="mta_materials"
    )

    title = models.TextField(blank=False, null=False, help_text="The title of the material.")

    needs_mta = models.BooleanField(default=False, null=True)
    needs_irb = models.BooleanField(default=False, null=True)
    needs_abstract = models.BooleanField(default=False, null=True)
    imported = models.BooleanField(default=False, null=False)
    needs_shipping_info = models.BooleanField(default=False, null=False)

    import_source = models.CharField(max_length=32, null=True, choices=IMPORTED_CHOICES)

    contact_user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        "Organization", blank=False, null=False, on_delete=models.CASCADE, related_name="materials"
    )

    organism = ArrayField(base_field=models.TextField(), blank=True, null=True)
    contact_name = models.TextField(blank=True, null=True)
    contact_email = models.TextField(blank=True, null=True)
    publication_title = models.TextField(blank=True, null=True)
    pre_print_doi = models.TextField(blank=True, null=True)
    pre_print_title = models.TextField(blank=True, null=True)
    citation = models.TextField(blank=True, null=True)
    additional_info = models.TextField(blank=True, null=True)
    embargo_date = models.DateField(blank=True, null=True)

    def has_publication(self):
        return not (self.pubmed_id == "")

    def has_pre_print(self):
        return not (self.pre_print_doi == "" and self.pre_print_title == "")
