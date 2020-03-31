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


class OrganizationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Organization"

    owner = factory.SubFactory(UserFactory)


class MaterialFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Material"

    material_type = "CELL_LINE"
    url = "https://www.atcc.org/products/all/HTB-38.aspx"

    contact_user = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(OrganizationFactory)
