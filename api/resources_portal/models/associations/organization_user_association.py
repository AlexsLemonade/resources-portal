from django.db import models

from resources_portal.models.organization import Organization
from resources_portal.models.user import User


class OrganizationUserAssociation(models.Model):

    organization = models.ForeignKey(
        Organization, blank=False, null=False, on_delete=models.CASCADE
    )
    user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "organization_user_associations"
        unique_together = ("organization", "user")
