from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from resources_portal.importers import geo, protocols_io, sra
from resources_portal.importers.protocols_io import ProtocolNotFoundError


def import_dataset(import_source, accession_code, user):
    """This function returns a Response object containing the json
    representation of the newly-created material object made using
    metadata from the import_source's API.
    """
    if import_source == "SRA":
        metadata = sra.gather_all_metadata(accession_code)
    elif import_source == "GEO":
        metadata = geo.gather_all_metadata(accession_code)

    if metadata == {}:
        return JsonResponse(
            {"error": "No data was found for the provided accession code"}, status=404
        )

    try:
        additional_metadata = {
            "accession_code": accession_code,
            "description": metadata["description"],
            "platform": metadata["platform"],
            "technology": metadata["technology"],
            "number_samples": metadata["number_samples"],
        }

        material_json = {
            "category": "DATASET",
            "imported": True,
            "import_source": import_source,
            "title": metadata["title"],
            "organisms": metadata["organism_names"],
            "url": metadata["url"],
            "contact_user": str(user.id),
            "additional_metadata": additional_metadata,
        }

        # Not all datasets will have a publication. This accounts for that.
        if "pubmed_id" in metadata.keys():
            material_json["pubmed_id"] = metadata["pubmed_id"]
            material_json["publication_title"] = metadata["publication_title"]

        return material_json

    except KeyError as error:
        return {
            "error": f"Unable to import SRA. The following attribute was not found: {str(error)}."
        }


def import_protocol(protocol_doi, user):
    """
    This function returns a Response object containing
    the json representation of the newly-created material object
    made using data from the protocols.io API.
    """

    try:
        metadata = protocols_io.gather_all_metadata(protocol_doi)
    except ProtocolNotFoundError:
        return {"error": f"The protocol matching DOI {protocol_doi} could not be found"}

    additional_metadata = {
        "protocol_name": metadata["protocol_name"],
        "description": metadata["description"],
        # There's no abstract to import.
        "abstract": "",
    }

    material_json = {
        "category": "PROTOCOL",
        "imported": True,
        "import_source": "PROTOCOLS_IO",
        "title": metadata["protocol_name"],
        "url": metadata["url"],
        "contact_user": str(user.id),
        "additional_metadata": additional_metadata,
    }

    return material_json


class ImportViewSet(viewsets.ViewSet):
    """ A viewset used to import all availible material data from a specified source."""

    http_method_names = ["post"]

    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        import_source = request.data["import_source"]

        if import_source == "SRA" or import_source == "GEO":
            material_json = import_dataset(
                import_source, request.data["accession_code"], request.user
            )
        elif import_source == "PROTOCOLS_IO":
            material_json = import_protocol(request.data["protocol_doi"], request.user)
        else:
            return JsonResponse(
                {"error": f'Invalid value for parameter "import_source": {import_source}.'},
                status=400,
            )

        if "error" in material_json:
            return JsonResponse(
                {"error": f'Invalid value for parameter "import_source": {import_source}.'},
                status=400,
            )
        else:
            return JsonResponse(material_json, status=200)
