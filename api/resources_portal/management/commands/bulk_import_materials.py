import csv
import json

from django.core.management.base import BaseCommand

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.models import Material, Organization, User

logger = get_and_configure_logger(__name__)


def get_readable_names(path="resources_portal/management/commands/readablenames.json"):
    with open(path) as readablenames_file:
        return json.load(readablenames_file)


class Command(BaseCommand):
    help = "Imports a CSV of materials into an organization."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            required=True,
            help=("""The CSV file containing one material per row."""),
        )

        parser.add_argument(
            "--organization-id",
            type=int,
            required=True,
            help=("""The ID of the organization that the materials should belong to."""),
        )

        parser.add_argument(
            "--contact-user-id",
            type=str,
            help=(
                "The ID of the user that will be the contact user for each material."
                " Defaults to the organization owner."
            ),
        )

    def handle(self, *args, **options):
        organization = Organization.objects.get(id=options["organization_id"])

        if options["contact_user_id"]:
            contact_user = User.objects.get(id=options["contact_user_id"])
        else:
            contact_user = organization.owner

        readable_names = {v: k for k, v in get_readable_names().items()}

        with open(options["file"]) as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                for key, value in row.items():
                    # Replace NA values with None.
                    if value == "NA":
                        row[key] = None

                    if key in readable_names:
                        row[readable_names[key]] = row.pop(key)

                # This will need to be a parameter or in the data itself.
                material = Material(
                    category="PDX",
                    title=row["patient_id"],
                    contact_user=contact_user,
                    organization=organization,
                    organisms=[row.pop("organisms")],
                    publication_title=row.pop("publication_title"),
                    pre_print_doi=row.pop("Pre-print DOI"),
                    pre_print_title=row.pop("Pre-print Title"),
                    citation=row.pop("citation"),
                    additional_info=row.pop("additional_info"),
                )
                material.additional_metadata = row
                material.save()
                material.grants.set(list(organization.grants.all()))
