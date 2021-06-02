from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from django_elasticsearch_dsl.registries import registry

from resources_portal.models.organization import Organization


@receiver(post_save)
def update_document(sender, **kwargs):
    """Update document on added/changed records."""
    app_label = sender._meta.app_label
    model_name = sender._meta.model_name

    if app_label == "resources_portal":
        if model_name in ["resources_portal_user", "organization", "material"]:
            registry.update(kwargs["instance"])


@receiver(post_delete)
def delete_document(sender, **kwargs):
    """Update document on deleted records."""
    app_label = sender._meta.app_label
    model_name = sender._meta.model_name

    if app_label == "resources_portal":
        if model_name in ["resources_portal_user", "organization", "material"]:
            registry.delete(kwargs["instance"], raise_on_error=False)


@receiver(m2m_changed, sender="resources_portal.OrganizationUserAssociation")
def add_member_permissions(sender, instance, action, reverse, model, pk_set, **kwargs):
    if action == "post_add" and type(instance) is Organization:
        for member in instance.members.all():
            instance.assign_member_perms(member)


@receiver(post_save, sender="resources_portal.OrganizationUserAssociation")
def add_member_permissions_2(sender, instance, **kwargs):
    """Django doesn't appear to offer a way to manage this without handling all the signals."""
    instance.organization.assign_member_perms(instance.user)
