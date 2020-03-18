from django.db import models

from .material import Material
from .user import User


class MaterialShareEvent(models.Model):
    class Meta:
        db_table = "material_share_events"
        get_latest_by = "created_at"

    objects = models.Manager()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    material = models.ForeignKey(
        Material, blank=False, null=False, on_delete=models.CASCADE, related_name="share_events"
    )

    # TODO: add possible choices
    event_type = models.CharField(max_length=255, blank=True, null=True)

    time = models.DateTimeField()

    user = models.ForeignKey(
        User,
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="material_share_events",
    )

    assigned_to = models.ForeignKey(
        User,
        blank=False,
        null=False,
        on_delete=models.CASCADE,
        related_name="material_share_assigned_to_set",
    )
