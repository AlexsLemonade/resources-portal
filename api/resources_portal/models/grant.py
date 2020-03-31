from django.db import models

from resources_portal.models.organization import Organization
from resources_portal.models.user import User


class Grant(models.Model):
    class Meta:
        db_table = "grants"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    title = models.TextField()
    funder_id = models.CharField(max_length=80)

    organizations = models.ManyToManyField(Organization, related_name="grants")
    materials = models.ManyToManyField("Material", related_name="grants")
    users = models.ManyToManyField(User, related_name="grants")
