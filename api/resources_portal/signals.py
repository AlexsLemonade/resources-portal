from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from django_elasticsearch_dsl.registries import registry

from resources_portal.models import Material
from resources_portal.models.organization import Organization
from resources_portal.models.user import User


@receiver(post_save)
def update_document(sender, **kwargs):
    """Update document on added/changed records."""
    app_label = sender._meta.app_label
    model_name = sender._meta.model_name

    if app_label == "resources_portal":
        if model_name == "resources_portal_user":
            instances = User.objects.all()
            for _instance in instances:
                registry.update(_instance)

        if model_name == "organization":
            instances = Organization.objects.all()
            for _instance in instances:
                registry.update(_instance)

        if model_name == "material":
            instances = Material.objects.all()
            for _instance in instances:
                registry.update(_instance)


@receiver(post_delete)
def delete_document(sender, **kwargs):
    """Update document on deleted records."""
    app_label = sender._meta.app_label
    model_name = sender._meta.model_name

    if app_label == "resources_portal":
        if model_name == "resources_portal_user":
            instances = User.objects.all()
            for _instance in instances:
                registry.delete(_instance, raise_on_error=False)

    if model_name == "organization":
        instances = Organization.objects.all()
        for _instance in instances:
            registry.delete(_instance, raise_on_error=False)

    if model_name == "material":
        instances = Material.objects.all()
        for _instance in instances:
            registry.delete(_instance, raise_on_error=False)


@receiver(m2m_changed, sender="resources_portal.OrganizationUserAssociation")
def add_member_permissions(sender, instance, action, reverse, model, pk_set, **kwargs):
    if action == "post_add" and type(instance) is Organization:
        for member in instance.members.all():
            instance.assign_member_perms(member)


@receiver(post_save, sender="resources_portal.OrganizationUserAssociation")
def add_member_permissions_2(sender, instance, **kwargs):
    """Django doesn't appear to offer a way to manage this without handling all the signals."""
    instance.organization.assign_member_perms(instance.user)


# @receiver(pre_save, sender=MaterialRequest)
# def model_pre_save(sender, instance, **kwargs):
#     changed_fields = {}
#     try:
#         old_instance = MaterialRequest.objects.get(pk=instance.pk)
#     except MaterialRequest.DoesNotExist:
#         changed_fields = kwargs

#     import pdb

#     pdb.set_trace()
