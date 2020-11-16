from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.models import Material

logger = get_and_configure_logger(__name__)


def validate_category(category):
    return len([choice for choice in Material.CATEGORY_CHOICES if category in choice]) > 0


def paginate_queryset(query_set, function, pagination):
    current_page = 0
    size = len(query_set)
    current_slice = []
    materials_updated = 0

    while current_page < size:
        if (size - current_page) < pagination:
            current_slice = query_set[current_page : current_page + (size - current_page)]
            current_page += size - current_page
        else:
            current_slice = query_set[current_page : current_page + pagination]
            current_page += pagination

        current_materials = []
        for material in current_slice:
            current_material = function(material)
            current_material.updated_at = timezone.now()
            current_materials.append(current_material)

        Material.objects.bulk_update(current_materials, ["additional_metadata", "updated_at"])
        materials_updated += len(current_materials)
        logger.info(
            f"{len(current_materials)} materials processed. {materials_updated} total processed so far."
        )

    return materials_updated


def log_nonapplicable_materials(query_set, key):
    if len(query_set) > 0:
        logger.warning(
            f"The key '{key}' was not present in {len(query_set)} materials. The IDs of these materials are: "
        )

        idString = ""
        for material in query_set:
            idString += str(material.id) + ", "

        idString = idString.strip(", ")
        logger.warning(idString)


def add_key(category, new_key, default, pagination):
    query_set = None
    materials_changed = 0

    if category:
        query_set = Material.objects.filter(category=category)
    else:
        query_set = Material.objects.all()

    def add_func(material):
        material.additional_metadata[new_key] = default
        return material

    materials_changed = paginate_queryset(query_set, add_func, pagination)

    logger.info(
        f"The key '{new_key}' was added to {materials_changed} materials. The default value was '{default}'."
    )


def remove_key(category, old_key, pagination):
    query_set = None
    materials_changed = 0

    if category:
        query_set = Material.objects.filter(category=category)
    else:
        query_set = Material.objects.all()

    filtered_query_set = query_set.filter(additional_metadata__has_key=old_key)
    not_applicable_query_set = query_set.exclude(additional_metadata__has_key=old_key)

    # Evaluates the queryset. Querysets are usually lazy, this forces evaluation
    len(not_applicable_query_set)

    def add_func(material):
        material.additional_metadata.pop(old_key)
        return material

    materials_changed = paginate_queryset(filtered_query_set, add_func, pagination)

    logger.info(f"The key '{old_key}' was removed from {materials_changed} materials.")

    log_nonapplicable_materials(not_applicable_query_set, old_key)


def material_additional_metadata_key_change(category, old_key, new_key, pagination):
    query_set = None
    materials_changed = 0

    if category:
        query_set = Material.objects.filter(category=category)
    else:
        query_set = Material.objects.all()

    filtered_query_set = query_set.filter(additional_metadata__has_key=old_key)
    not_applicable_query_set = query_set.exclude(additional_metadata__has_key=old_key)

    # Evaluates the queryset. Querysets are usually lazy, this forces evaluation
    len(not_applicable_query_set)

    def add_func(material):
        material.additional_metadata[new_key] = material.additional_metadata.pop(old_key)
        return material

    materials_changed = paginate_queryset(filtered_query_set, add_func, pagination)

    logger.info(f"The key '{old_key}' was changed to '{new_key}' in {materials_changed} materials.")

    log_nonapplicable_materials(not_applicable_query_set, old_key)


class Command(BaseCommand):
    """
    This is a command to add, remove, or change the names of additional metadata fields currently in the server.
    It has the following use cases:
    1. Change a metadata key
    ./rportal migrate-metadata-keys old_key new_key --category [CATEGORY] --pagination [PAGINATION]
    2. Add a metadata key
    ./rportal migrate-metadata-keys --add new_key --category [CATEGORY] --default [DEFAULT] --pagination [PAGINATION]
    The default is the the value that all the new keys will be initialized with.
    2. Remove a metadata key
    ./rportal migrate-metadata-keys --remove old_key --category [CATEGORY] --pagination [PAGINATION]
    For each use case, the category parameter is optional, and categories should be specified in all caps, like "PLASMID" or "MODEL_ORGANISM".
    The pagination parameter is also optional. It controls the size of the queryset pagination.
    """

    help = "Replaces all instances of old_key in materials (of an optional category) with new_key."

    def add_arguments(self, parser):
        # Positional arguments
        parser.add_argument("old_key", nargs="?", default=None, type=str)
        parser.add_argument("new_key", nargs="?", default=None, type=str)

        # Optional arguments
        parser.add_argument("--category", nargs="?", default=None)
        parser.add_argument("--pagination", nargs="?", default=None, type=int)
        parser.add_argument("--add", nargs="?", default=None)
        parser.add_argument("--default", nargs="?", default="")
        parser.add_argument("--remove", nargs="?", default=None)

    def handle(self, *args, **options):
        category = options["category"]
        if category is not None:
            if not validate_category(category):
                raise CommandError(
                    f"The provided category '{category}' is not a valid material category."
                )

        # Default query pagination is 100
        pagination = 100
        if options["pagination"] is not None:
            pagination = options["pagination"]

        if options["add"] is not None:
            add_key(category, options["add"], options["default"], pagination)
            return
        if options["remove"] is not None:
            remove_key(category, options["remove"], pagination)
            return
        if options["old_key"] is None:
            raise CommandError("Missing required argument old_key")
        if options["new_key"] is None:
            raise CommandError("Missing required argument new_key")
        material_additional_metadata_key_change(
            category, options["old_key"], options["new_key"], pagination
        )
