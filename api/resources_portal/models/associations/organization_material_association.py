from django.db import models

from resources_portal.models.material import Material
from resources_portal.models.organization import Organization


class OrganizationMaterialAssociation(models.Model):

    organization = models.ForeignKey(
        Organization, blank=False, null=False, on_delete=models.CASCADE
    )
    material = models.ForeignKey(Material, blank=False, null=False, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "organization_material_associations"
        unique_together = ("organization", "material")
