import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


class NonDeletedObjectsManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted=False)


class DeletedObjectsManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted=True)


class User(AbstractUser):
    class Meta:
        get_latest_by = "created_at"
        ordering = ["created_at"]

    objects = NonDeletedObjectsManager()
    deleted_objects = DeletedObjectsManager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_name = models.TextField(null=True)
    orcid = models.TextField(unique=True)
    refresh_token = models.TextField()
    access_token = models.TextField()
    deleted = models.BooleanField(default=False, null=False)

    organizations = models.ManyToManyField("Organization", through="OrganizationUserAssociation")
    personal_organization = models.ForeignKey(
        "Organization", blank=True, null=True, on_delete=models.CASCADE, related_name="+"
    )

    def save(self, *args, **kwargs):
        self.id = uuid.UUID(str(self.id))
        super(User, self).save(*args, **kwargs)

    def delete(self):
        self.deleted = True
        self.save()

    def __str__(self):
        return str(self.id)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
