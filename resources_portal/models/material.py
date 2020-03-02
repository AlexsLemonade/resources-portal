import uuid

from django.contrib.postgres.fields import JSONField
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from .user import User


class Material(models.Model):
    class Meta:
        db_table = "materials"
        get_latest_by = "created_at"

    objects = models.Manager()

    url = models.TextField(blank=True)
    pubmed_id = models.CharField(max_length=32, blank=True)

    metadata = JSONField(default=dict)

    primary_contact = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
