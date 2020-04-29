from django.utils import timezone

import factory


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


class OrganizationUserAssociationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.OrganizationUserAssociation"

    user = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(PersonalOrganizationFactory)


class OrganizationFactory(PersonalOrganizationFactory):
    membership1 = factory.RelatedFactory(OrganizationUserAssociationFactory, "organization")
    membership2 = factory.RelatedFactory(OrganizationUserAssociationFactory, "organization")


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
