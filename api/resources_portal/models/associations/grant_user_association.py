from django.db import models

from resources_portal.models.grant import Grant
from resources_portal.models.user import User


class GrantUserAssociation(models.Model):

    grant = models.ForeignKey(Grant, blank=False, null=False, on_delete=models.CASCADE)
    user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "grant_user_associations"
        unique_together = ("grant", "user")
