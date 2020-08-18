import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from computedfields.models import ComputedFieldsModel, computed


class NonDeletedObjectsManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted=False)


class DeletedObjectsManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted=True)


class User(AbstractUser, ComputedFieldsModel):
    class Meta:
        get_latest_by = "created_at"
        ordering = ["created_at"]

    objects = NonDeletedObjectsManager()
    deleted_objects = DeletedObjectsManager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_name = models.TextField(null=True)
    orcid = models.TextField(unique=True, null=True)
    refresh_token = models.TextField()
    access_token = models.TextField()
    deleted = models.BooleanField(default=False, null=False)

    organizations = models.ManyToManyField("Organization", through="OrganizationUserAssociation")
    personal_organization = models.ForeignKey(
        "Organization", blank=True, null=True, on_delete=models.CASCADE, related_name="+"
    )

    # Returns a unique username for each user, allowing for users with the same first and last name.
    # The first user with a certain name will have username "FirstLast", while subsequent users with the same name
    # will have usernames "FirstLast1", "FirstLast2", ... "FirstLast{n}"
    @computed(
        models.CharField(
            error_messages={"unique": "A user with that username already exists."},
            unique=True,
            max_length=150,
            validators=[UnicodeUsernameValidator()],
            verbose_name="username",
        )
    )
    def username(self):
        users_with_same_name_count = (
            User.objects.filter(first_name=self.first_name, last_name=self.last_name)
            .exclude(pk=self.id)
            .count()
        )

        if users_with_same_name_count > 0:
            return f"{self.first_name}{self.last_name}{users_with_same_name_count}"
        else:
            return f"{self.first_name}{self.last_name}"

    @computed(models.TextField(null=False, blank=False))
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

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
