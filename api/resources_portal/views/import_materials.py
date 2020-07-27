from django.forms.models import model_to_dict
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from resources_portal.importers import geo, sra
from resources_portal.models import Grant, Material, Organization


def import_dataset(import_source, accession_code, organization, grant, user):
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
            "study_id": accession_code,
            "description": metadata["description"],
            "platform": metadata["platform"],
            "technology": metadata["technology"],
            "num_samples": metadata["num_samples"],
        }

        material_json = {
            "organization": organization,
            "category": "DATASET",
            "imported": True,
            "import_source": import_source,
            "title": metadata["title"],
            "organisms": metadata["organism_names"],
            "url": metadata["url"],
            "contact_user": user,
            "additional_metadata": additional_metadata,
        }

        # Not all datasets will have a publication. This accounts for that.
        if "pubmed_id" in metadata.keys():
            material_json["pubmed_id"] = metadata["pubmed_id"]
            material_json["publication_title"] = metadata["publication_title"]

        material = Material(**material_json)
        material.save()

        material.grants.set([grant])

    except KeyError as error:
        return JsonResponse(
            {
                "error": f"Unable to import SRA. The following attribute was not found: {str(error)}."
            },
            status=400,
        )

    material_json = model_to_dict(material)
    material_json["grants"] = [material_json["grants"][0].id]

    return JsonResponse(material_json, status=201)


def import_protocol(protocol_id, organization, grant, user):
    """
    This function returns a Response object containing
    the json representation of the newly-created material object
    made using data from the protocols.io API.
    """
    metadata = gather_all_metadata(protocol_id)


class ImportViewSet(viewsets.ViewSet):
    """ A viewset used to import all availible material data from a specified source."""

    http_method_names = ["post"]

    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        organization = Organization.objects.get(pk=request.data["organization_id"])
        grant = Grant.objects.get(pk=request.data["grant_id"])

        if grant not in request.user.grants.all():
            return JsonResponse({"error": f"The user does not own grant id {grant.id}"}, status=403)

        if request.user not in organization.members.all():
            return JsonResponse(
                {"error": f"The user is not a member of organization id {organization.id}"},
                status=403,
            )

        import_type = request.data["import_type"]

        if import_type == "SRA" or import_type == "GEO":
            return import_dataset(
                import_type, request.data["study_accession"], organization, grant, request.user
            )
        elif import_type == "PROTOCOL_IO":
            return import_protocol(request.data["protocol_doi"], organization, grant, request.user)
        else:
            return JsonResponse(
                {"error": f'Invalid value for parameter "import_type": {import_type}.'}, status=400
            )
