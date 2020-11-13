from django.core.management.base import BaseCommand
from django.db import transaction

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.models import Material

logger = get_and_configure_logger(__name__)


def validateCategory(category):
    return len([choice for choice in Material.CATEGORY_CHOICES if category in choice]) > 0


def addKey(category, new_key):
    querySet = None
    materials_changed = 0

    if category:
        if not validateCategory(category):
            logger.error("The provided category is not a valid material category.")
            return
        querySet = Material.objects.filter(category=category)
    else:
        querySet = Material.objects.all()

    with transaction.atomic():
        for material in querySet:
            material.additional_metadata[new_key] = ""
            material.save()
            materials_changed += 1

    logger.info(f"The key '{new_key}' was added to {materials_changed} materials.")


def removeKey(category, old_key):
    querySet = None
    materials_changed = 0

    if category:
        if not validateCategory(category):
            logger.error("The provided category is not a valid material category.")
            return
        querySet = Material.objects.filter(category=category)
    else:
        querySet = Material.objects.all()

    with transaction.atomic():
        for material in querySet:
            material.additional_metadata.pop(old_key)
            material.save()
            materials_changed += 1

    logger.info(f"The key '{old_key}' was removed from {materials_changed} materials.")


def material_additional_metadata_key_change(category, old_key, new_key):
    querySet = None
    materials_changed = 0

    if category:
        if not validateCategory(category):
            logger.error("The provided category is not a valid material category.")
            return
        querySet = Material.objects.filter(additional_metadata__has_key=old_key, category=category)
    else:
        querySet = Material.objects.filter(additional_metadata__has_key=old_key)

    with transaction.atomic():
        for material in querySet:
            material.additional_metadata[new_key] = material.additional_metadata[old_key]
            material.additional_metadata.pop(old_key)
            material.save()
            materials_changed += 1

    logger.info(f"The key '{old_key}' was changed to '{new_key}' in {materials_changed} materials.")


# This is a command to add, remove, or change the names of additional metadata fields currently in the server.
# It has the following use cases:
# 1. Change a metadata key
# ./rportal migrate-metadata-keys old_key new_key --category [CATEGORY]
# 2. Add a metadata key
# ./rportal migrate-metadata-keys --add new_key --category [CATEGORY]
# 2. Remove a metadata key
# ./rportal migrate-metadata-keys --remove old_key --category [CATEGORY]
# For each use case, the category parameter is optional, and categories should be specified in all caps, like "PLASMID" or "MODEL_ORGANISM".


class Command(BaseCommand):
    help = "Replaces all instances of old_key in materials (of an optional category) with new_key."

    def add_arguments(self, parser):
        # Positional arguments
        parser.add_argument("old_key", nargs="?", default=None, type=str)
        parser.add_argument("new_key", nargs="?", default=None, type=str)

        # Optional arguments
        parser.add_argument("--category", nargs="?", default=None)
        parser.add_argument("--add", nargs="?", default=None)
        parser.add_argument("--remove", nargs="?", default=None)

    def handle(self, *args, **options):
        if options["add"] != None:
            addKey(options["category"], options["add"])
            return
        if options["remove"] != None:
            removeKey(options["category"], options["remove"])
            return

        if options["old_key"] == None:
            logger.error("Missing required argument oldKey")
            return
        if options["new_key"] == None:
            logger.error("Missing required argument newKey")
            return
        material_additional_metadata_key_change(
            options["category"], options["old_key"], options["new_key"]
        )
