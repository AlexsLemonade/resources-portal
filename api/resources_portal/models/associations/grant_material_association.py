from django.db import models

from resources_portal.models.grant import Grant
from resources_portal.models.material import Material


class GrantMaterialAssociation(models.Model):

    grant = models.ForeignKey(Grant, blank=False, null=False, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, blank=False, null=False, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "grant_material_associations"
        unique_together = ("grant", "material")
