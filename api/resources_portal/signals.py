from django.db.models.signals import post_delete, post_init, post_save
from django.dispatch import receiver

from django_elasticsearch_dsl.registries import registry

from resources_portal.models.documents import MaterialDocument, OrganizationDocument, UserDocument


@receiver(post_save)
def update_document(sender, **kwargs):
    """Update document on added/changed records."""
    app_label = sender._meta.app_label
    model_name = sender._meta.model_name
    instance = kwargs["instance"]

    if app_label == "resources_portal":
        if model_name == "resources_portal_user":
            instances = instance.users.all()
            for _instance in instances:
                registry.update(_instance)

        if model_name == "organization":
            instances = instance.organizations.all()
            for _instance in instances:
                registry.update(_instance)

        if model_name == "material":
            instances = instance.materials.all()
            for _instance in instances:
                registry.update(_instance)


@receiver(post_delete)
def delete_document(sender, **kwargs):
    """Update document on deleted records."""
    app_label = sender._meta.app_label
    model_name = sender._meta.model_name
    instance = kwargs["instance"]

    if app_label == "resources_portal":
        if model_name == "resources_portal_user":
            instances = instance.users.all()
            for _instance in instances:
                registry.delete(_instance, raise_on_error=False)

    if model_name == "organization":
        instances = instance.organizations.all()
        for _instance in instances:
            registry.delete(_instance, raise_on_error=False)

    if model_name == "material":
        instances = instance.materials.all()
        for _instance in instances:
            registry.delete(_instance, raise_on_error=False)
