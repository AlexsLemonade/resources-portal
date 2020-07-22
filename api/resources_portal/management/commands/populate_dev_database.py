from json import loads

from django.core.management.base import BaseCommand
from django.db.models.fields.related import ForeignKey
from django.utils import dateparse

from guardian.shortcuts import assign_perm

from resources_portal.models import (
    Attachment,
    Grant,
    Material,
    MaterialRequest,
    MaterialShareEvent,
    Notification,
    Organization,
    OrganizationInvitation,
    ShippingRequirements,
    User,
)

model_id_dict = {}

user_id_list = []


def get_user_ids(users_json):
    for user in users_json:
        user_id_list.append(user["id"])


def parse_int_or_uuid(val):
    try:
        return int(val) - 1
    except ValueError:
        return user_id_list.index(val)


def add_class_to_database(class_json, Class):
    print(f"Inserting {Class.__name__} into database...")

    model_id_dict[Class.__name__] = []

    for element in class_json:
        if "updated_at" in element:
            element["updated_at"] = dateparse.parse_datetime(element["updated_at"])
        if "created_at" in element:
            element["created_at"] = dateparse.parse_datetime(element["created_at"])
        if "date_joined" in element:
            element["date_joined"] = dateparse.parse_datetime(element["date_joined"])

        for field in Class._meta.fields:
            if isinstance(field, ForeignKey):
                if (field.attname in element.keys()) and element[field.attname]:
                    index = parse_int_or_uuid(element[field.attname])
                    element[field.attname] = model_id_dict[field.related_model.__name__][index]

        element_in_class = Class(**element)
        element_in_class.save()

        model_id_dict[Class.__name__].append(element_in_class.id)


def populate_dev_database():
    # Add users
    users_json = loads(open("./dev_data/users.json").read())
    add_class_to_database(users_json["resources_portal_user"], User)

    get_user_ids(users_json["resources_portal_user"])

    # add shipping requirements
    shipping_requirements_json = loads(open("./dev_data/shipping_requirements.json").read())
    add_class_to_database(shipping_requirements_json["shipping_requirements"], ShippingRequirements)

    # add Cl
    organizations_json = loads(open("./dev_data/organizations.json").read())
    add_class_to_database(organizations_json["organizations"], Organization)

    # add attachments
    attachments_json = loads(open("./dev_data/attachments.json").read())
    add_class_to_database(attachments_json["attachments"], Attachment)

    # add materials
    materials_json = loads(open("./dev_data/materials.json").read())
    add_class_to_database(materials_json["materials"], Material)

    # add notifications
    notifications_json = loads(open("./dev_data/notifications.json").read())
    add_class_to_database(notifications_json["notifications"], Notification)

    # add grants
    grants_json = loads(open("./dev_data/grants.json").read())
    add_class_to_database(grants_json["grants"], Grant)

    # add share events
    add_class_to_database(materials_json["materials_share_events"], MaterialShareEvent)

    # add requests
    add_class_to_database(materials_json["materials_requests"], MaterialRequest)

    # add organization invitations
    add_class_to_database(organizations_json["organization_invitations"], OrganizationInvitation)

    grant_list = []
    for grant_id in model_id_dict["Grant"]:
        grant_list.append(Grant.objects.get(pk=grant_id))

    user_list = []
    for user_id in model_id_dict["User"]:
        user_list.append(User.objects.get(pk=user_id))

    material_list = []
    for material_id in model_id_dict["Material"]:
        material_list.append(Material.objects.get(pk=material_id))

    org_list = []
    for org_id in model_id_dict["Organization"]:
        org_list.append(Organization.objects.get(pk=org_id))

    # add relations of organizations and members
    for i in organizations_json["organizations_members"]:
        org = org_list[parse_int_or_uuid(i["organization_id"])]
        user = user_list[parse_int_or_uuid(i["user_id"])]
        org.members.add(user)

    # add relation of grants and materials
    for i in grants_json["grants_materials"]:
        grant = grant_list[parse_int_or_uuid(i["grant_id"])]
        material = material_list[parse_int_or_uuid(i["material_id"])]
        grant.materials.add(material)

    # add relation of grants and organizations
    for i in grants_json["grants_organizations"]:
        grant = grant_list[parse_int_or_uuid(i["grant_id"])]
        org = org_list[parse_int_or_uuid(i["organization_id"])]
        grant.organizations.add(org)

    # add relation of grants and users
    for i in grants_json["grants_users"]:
        grant = grant_list[parse_int_or_uuid(i["grant_id"])]
        user = user_list[parse_int_or_uuid(i["user_id"])]
        grant.users.add(user)

    # add permissions for each user
    permissions_json = loads(open("./dev_data/permissions.json").read())
    for permission_set in permissions_json["user_organization_permissions"]:
        user = User.objects.get(pk=permission_set.pop("user_id"))
        organization = Organization.objects.get(pk=permission_set.pop("organization_id"))

        for perm in permission_set:
            if permission_set[perm]:
                assign_perm(perm, user, organization)


class Command(BaseCommand):
    help = "Populates the database with test data"

    def handle(self, *args, **options):
        populate_dev_database()
