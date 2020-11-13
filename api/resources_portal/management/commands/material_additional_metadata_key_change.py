from django.core.management.base import BaseCommand

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.models import Material

logger = get_and_configure_logger(__name__)


def material_additional_metadata_key_change(category, old_key, new_key):
    querySet = None

    materials_changed = 0

    if category:
        if len([choice for choice in Material.CATEGORY_CHOICES if category in choice]) == 0:
            logger.error("The provided category is not a valid material category.")
            return
        querySet = Material.objects.filter(additional_metadata__has_key=old_key, category=category)
    else:
        querySet = Material.objects.filter(additional_metadata__has_key=old_key)

    for material in querySet:
        material.additional_metadata[new_key] = material.additional_metadata[old_key]
        material.additional_metadata.pop(old_key)
        material.save()
        materials_changed += 1

    logger.info(f"The key '{old_key}' was changed to '{new_key}' in {materials_changed} materials.")


# This is a command to change the names of additional metadata fields currently in the server.
# It can be called in this way:
# ./rportal migrate-metadata-keys old_key new_key --category [CATEGORY]
# the category parameter is optional, and categories should be specified in all caps, like "PLASMID" or "MODEL_ORGANISM".
class Command(BaseCommand):
    help = "Replaces all instances of old_key in materials (of an optional category) with new_key."

    def add_arguments(self, parser):
        # Positional arguments
        parser.add_argument("old_key", type=str)
        parser.add_argument("new_key", type=str)

        # Optional arguments
        parser.add_argument("--category", nargs="?", default=None)

    def handle(self, *args, **options):
        material_additional_metadata_key_change(
            options["category"], options["old_key"], options["new_key"]
        )
