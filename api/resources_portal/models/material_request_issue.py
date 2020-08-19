from django.db import models

from safedelete.managers import SafeDeleteDeletedManager, SafeDeleteManager
from safedelete.models import SOFT_DELETE, SafeDeleteModel

from resources_portal.models.material_request import MaterialRequest


class MaterialRequestIssue(SafeDeleteModel):
    class Meta:
        db_table = "material_request_issues"
        get_latest_by = "created_at"
        ordering = ["created_at", "id"]

    objects = SafeDeleteManager()
    deleted_objects = SafeDeleteDeletedManager()
    _safedelete_policy = SOFT_DELETE

    STATUS_CHOICES = (
        ("OPEN", "OPEN"),
        ("CLOSED", "CLOSED"),
    )

    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    material_request = models.ForeignKey(
        MaterialRequest, blank=False, null=False, on_delete=models.CASCADE, related_name="issues"
    )

    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="OPEN")
