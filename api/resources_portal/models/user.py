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
    objects = NonDeletedObjectsManager()
    deleted_objects = DeletedObjectsManager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_name = models.TextField()
    deleted = models.BooleanField(default=False, null=False)

    organizations = models.ManyToManyField("Organization", through="OrganizationUserAssociation")

    grants = models.ManyToManyField("Grant", through="GrantUserAssociation")

    def save(self, *args, **kwargs):
        self.id = uuid.UUID(str(self.id))
        super(User, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.id)

    def delete(self):
        self.deleted = True
        self.save()


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
