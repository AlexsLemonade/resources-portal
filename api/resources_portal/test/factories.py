from django.utils import timezone

import factory
from factory import post_generation
from guardian.shortcuts import assign_perm

from resources_portal.models import Organization, User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.User"
        django_get_or_create = ("username",)

    id = factory.Faker("uuid4")
    username = factory.Sequence(lambda n: f"testuser{n}")
    password = factory.Faker(
        "password", length=10, special_chars=True, digits=True, upper_case=True, lower_case=True,
    )
    email = factory.Faker("email")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    is_active = True
    is_staff = False

    created_at = timezone.now()
    updated_at = timezone.now()

    @factory.post_generation
    def organizations(self, create, extracted, **kwargs):
        if not create:
            # Simple build, do nothing.
            return

        if extracted:
            for organization in extracted:
                self.organizations.add(organization)


class PersonalOrganizationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Organization"

    owner = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"test_organization{n}")

    @factory.post_generation
    def organizations(self, create, extracted, **kwargs):
        self.members.add(self.owner)


class OrganizationUserAssociationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.OrganizationUserAssociation"

    user = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(PersonalOrganizationFactory)


class OrganizationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Organization"

    name = "test_organization"
    owner = factory.SubFactory(UserFactory)
    membership1 = factory.RelatedFactory(OrganizationUserAssociationFactory, "organization")

    @post_generation
    def post(self, create, extracted, **kwargs):
        self.members.add(self.owner)


class MaterialFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Material"

    category = "CELL_LINE"
    url = "https://www.atcc.org/products/all/HTB-38.aspx"
    title = "HT-29 (ATCC® HTB-38™)"

    contact_user = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(OrganizationFactory)


class OrganizationInvitationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.OrganizationInvitation"

    requester = factory.SubFactory(UserFactory)
    request_reciever = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(OrganizationFactory)

    status = "PENDING"
    invite_or_request = "INVITE"

    @post_generation
    def post(self, create, extracted, **kwargs):
        new = User.objects.get(id=self.request_reciever.id)
        newOrg = Organization.objects.get(id=self.organization.id)

        assign_perm("add_members_and_manage_permissions", new, newOrg)


class LeafGrantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Grant"

    title = "Young Investigator's Grant"
    funder_id = "1234567890"


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


class GrantFactory(LeafGrantFactory):
    user1 = factory.RelatedFactory(GrantUserAssociationFactory, "grant")
    user2 = factory.RelatedFactory(GrantUserAssociationFactory, "grant")
    organization1 = factory.RelatedFactory(GrantOrganizationAssociationFactory, "grant")
    organization2 = factory.RelatedFactory(GrantOrganizationAssociationFactory, "grant")
    material1 = factory.RelatedFactory(GrantMaterialAssociationFactory, "grant")
    material2 = factory.RelatedFactory(GrantMaterialAssociationFactory, "grant")
