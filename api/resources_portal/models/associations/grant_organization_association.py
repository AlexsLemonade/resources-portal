from django.db import models

from resources_portal.models.grant import Grant
from resources_portal.models.organization import Organization


class GrantOrganizationAssociation(models.Model):

    grant = models.ForeignKey(Grant, blank=False, null=False, on_delete=models.CASCADE)
    organization = models.ForeignKey(
        Organization, blank=False, null=False, on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "grant_organization_associations"
        unique_together = ("grant", "organization")
