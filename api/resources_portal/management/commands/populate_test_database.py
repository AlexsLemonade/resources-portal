from json import loads

from django.core.management.base import BaseCommand

from resources_portal.models import (
    Attachment,
    Grant,
    Material,
    MaterialRequest,
    MaterialShareEvent,
    Organization,
    OrganizationInvitation,
    OrganizationUserSetting,
    User,
)


class Command(BaseCommand):
    help = "Populates the database with test data"

    def handle(self, *args, **options):
        def add_class_to_database(class_json, Class):
            print(f"Inserting {Class.__name__} into database...")
            for element in class_json:
                element_in_class = Class(**element)
                element_in_class.save()

        # Add users
        users_json = loads(open("./dev_data/users.json").read())
        add_class_to_database(users_json["resources_portal_user"], User)

        # add organizations
        organizations_json = loads(open("./dev_data/organizations.json").read())
        add_class_to_database(organizations_json["organizations"], Organization)

        # add attachments
        attachments_json = loads(open("./dev_data/attachments.json").read())
        add_class_to_database(attachments_json["attachments"], Attachment)

        # add materials
        materials_json = loads(open("./dev_data/materials.json").read())
        add_class_to_database(materials_json["materials"], Material)

        # add grants
        grants_json = loads(open("./dev_data/grants.json").read())
        add_class_to_database(grants_json["grants"], Grant)

        # add user settings
        add_class_to_database(users_json["organization_user_setting"], OrganizationUserSetting)

        # add share events
        add_class_to_database(materials_json["materials_share_events"], MaterialShareEvent)

        # add requests
        add_class_to_database(materials_json["materials_requests"], MaterialRequest)

        # add organization invitations
        add_class_to_database(
            organizations_json["organization_invitations"], OrganizationInvitation
        )

        # add relation of organizations and members
        for i in organizations_json["organizations_members"]:
            myOrg = Organization.objects.get(id=i["organization_id"])
            myUser = User.objects.get(id=i["user_id"])
            myOrg.members.add(myUser)

        # add relation of grants and materials
        for i in grants_json["grants_materials"]:
            myGrant = Grant.objects.get(id=i["grant_id"])
            myMaterial = Material.objects.get(id=i["material_id"])
            myGrant.materials.add(myMaterial)

        # add relation of grants and organizations
        for i in grants_json["grants_organizations"]:
            myGrant = Grant.objects.get(id=i["grant_id"])
            myOrg = Organization.objects.get(id=i["organization_id"])
            myGrant.organizations.add(myOrg)

        # add relation of grants and users
        for i in grants_json["grants_users"]:
            myGrant = Grant.objects.get(id=i["grant_id"])
            myUser = User.objects.get(id=i["user_id"])
            myGrant.users.add(myUser)
