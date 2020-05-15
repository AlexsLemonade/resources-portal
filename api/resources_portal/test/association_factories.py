from django.utils import timezone

import factory
from factory import post_generation
from guardian.shortcuts import assign_perm

from resources_portal.models import Organization, User
from resources_portal.test.factories import (
    LeafGrantFactory,
    MaterialFactory,
    PersonalOrganizationFactory,
    UserFactory,
)


class OrganizationUserAssociationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.OrganizationUserAssociation"

    user = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(PersonalOrganizationFactory)


class OrganizationMaterialAssociationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.OrganizationUserAssociation"

    material = factory.SubFactory(MaterialFactory)
    organization = factory.SubFactory(PersonalOrganizationFactory)


class GrantUserAssociationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.GrantUserAssociation"

    user = factory.SubFactory(UserFactory)
    grant = factory.SubFactory(LeafGrantFactory)


class GrantOrganizationAssociationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.GrantOrganizationAssociation"

    organization = factory.SubFactory(PersonalOrganizationFactory)
    grant = factory.SubFactory(LeafGrantFactory)


class GrantMaterialAssociationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.GrantMaterialAssociation"

    material = factory.SubFactory(MaterialFactory)
    grant = factory.SubFactory(LeafGrantFactory)
