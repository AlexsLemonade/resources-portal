from django.utils import timezone

import factory
from factory import post_generation
from guardian.shortcuts import assign_perm

from resources_portal.models import Organization, OrganizationUserSetting, User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.User"
        django_get_or_create = ("username",)

    id = factory.Faker("uuid4")
    username = factory.Sequence(lambda n: f"testuser{n}")
    orcid = factory.Faker("uuid4")
    orcid_refresh_token = "a refresh token"
    orcid_access_token = "a access token"
    password = factory.Faker(
        "password",
        length=10,
        special_chars=True,
        digits=True,
        upper_case=True,
        lower_case=True,
    )
    email = factory.Faker("email")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    is_active = True
    is_superuser = False
    is_staff = False
    receive_non_assigned_notifs = False
    receive_weekly_digest = True
    # This can get recursive, so if someone needs it they can
    # construct it and pass it in.
    personal_organization = None

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


class AddressFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Address"

    user = factory.SubFactory(UserFactory)
    saved_for_reuse = True
    name = "My Lab's Address"
    institution = "Ranch Labs Inc."

    address_line_1 = "11 Ranch Lane"
    address_line_2 = "Suite 3000"
    locality = "Ranchville"
    postal_code = "12345"
    state = "Pennsylvania"
    country = "US"


class PersonalOrganizationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Organization"

    is_personal_organization = True
    owner = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"test_organization{n}")
    description = "Test description."

    @factory.post_generation
    def make_self_personal_org_of_owner(self, create, extracted, **kwargs):
        self.owner.personal_organization = self
        if create:
            self.owner.save()

    @factory.post_generation
    def organizations(self, create, extracted, **kwargs):
        self.members.add(self.owner)


class OrganizationUserAssociationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.OrganizationUserAssociation"

    user = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(PersonalOrganizationFactory, owner=user)


class OrganizationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Organization"

    name = "test_organization"
    description = "Test description."
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


class ShippingRequirementFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.ShippingRequirement"

    organization = factory.SubFactory(OrganizationFactory)
    restrictions = "North America only."
    needs_shipping_address = True
    needs_payment = True
    sharer_pays_shipping = False
    accepts_shipping_code = True
    accepts_reimbursement = False
    accepts_other_payment_methods = False


class OrganizationInvitationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.OrganizationInvitation"

    requester = factory.SubFactory(UserFactory)
    request_receiver = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(OrganizationFactory)

    status = "PENDING"
    invite_or_request = "INVITE"

    @post_generation
    def post(self, create, extracted, **kwargs):
        requester = User.objects.get(id=self.requester.id)
        newOrg = Organization.objects.get(id=self.organization.id)

        OrganizationUserSetting.objects.get_or_create(user=requester, organization=newOrg)

        assign_perm("add_members", requester, newOrg)


class OrganizationUserSettingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.OrganizationUserSetting"

    organization = factory.SubFactory(OrganizationFactory)
    user = factory.SubFactory(UserFactory)

    @post_generation
    def post(self, create, extracted, **kwargs):
        self.organization.members.add(self.user)


class AttachmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Attachment"

    filename = "nerd_sniping.png"
    description = "A file for testing"
    s3_bucket = "https://bucket-name.s3.region.amazonaws.com/keyname"
    s3_key = "s3 key"
    owned_by_org = factory.SubFactory(OrganizationFactory)
    owned_by_user = factory.SubFactory(UserFactory)


class MaterialRequestFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.MaterialRequest"

    assigned_to = factory.SubFactory(UserFactory)
    requester = factory.SubFactory(UserFactory)

    rejection_reason = "I won't have my science used for Evil!"
    material = factory.SubFactory(MaterialFactory)
    requester_abstract = "We need these for science!"

    payment_method = "SHIPPING_CODE"
    payment_method_notes = "UPS123456"

    @post_generation
    def post(self, create, extracted, **kwargs):
        self.executed_mta_attachment = AttachmentFactory(
            owned_by_org=self.material.organization, owned_by_user=self.material.organization.owner
        )
        self.irb_attachment = AttachmentFactory(
            owned_by_org=self.material.organization, owned_by_user=self.requester
        )
        self.requester_signed_mta_attachment = AttachmentFactory(
            owned_by_org=self.material.organization, owned_by_user=self.requester
        )
        self.save()


class MaterialRequestIssueFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.MaterialRequestIssue"

    description = "I never received my package!"
    status = "OPEN"
    material_request = factory.SubFactory(MaterialRequestFactory)


class FulfillmentNoteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.FulfillmentNote"

    created_by = factory.SubFactory(UserFactory)
    material_request = factory.SubFactory(MaterialRequestFactory)
    text = "Your tracking code is 123XYZ."


class LeafGrantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Grant"

    title = "Young Investigator's Grant"
    funder_id = "1234567890"


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
    user = factory.SubFactory(UserFactory)
    organization1 = factory.RelatedFactory(GrantOrganizationAssociationFactory, "grant")
    material1 = factory.RelatedFactory(GrantMaterialAssociationFactory, "grant")


class NotificationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "resources_portal.Notification"

    notification_type = "REPORT_TO_GRANTS_TEAM"
    notified_user = factory.SubFactory(UserFactory)
    associated_user = factory.SubFactory(UserFactory)
    grant = factory.SubFactory(LeafGrantFactory)
    organization = None

    @post_generation
    def post(self, create, extracted, **kwargs):
        self.grant.user = self.notified_user
        self.grant.save()

        if not self.organization:
            self.organization = OrganizationFactory(owner=self.notified_user)

        self.material = MaterialFactory(
            organization=self.organization, contact_user=self.notified_user
        )
        self.material_request = MaterialRequestFactory(
            material=self.material, assigned_to=self.notified_user, requester=self.associated_user
        )
        self.material_request_issue = MaterialRequestIssueFactory(
            material_request=self.material_request
        )

        self.save()
