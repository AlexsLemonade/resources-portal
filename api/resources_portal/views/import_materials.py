from django.forms.models import model_to_dict
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from resources_portal.models import Grant, Material, Organization
from resources_portal.views.import_sra_utils import ENA_URL_TEMPLATE, gather_all_metadata


def import_sra(run_accession, organization, grant, user):
    """
    This function returns a Response object containing the json representation of the newly-created material object
    made using SRA data.
    """
    metadata = gather_all_metadata(run_accession)

    if metadata == {}:
        return JsonResponse(
            {"error": "No data was found for the provided accession code"}, status=404
        )

    # note for the PR: currently, I use "library-construction-protocol" to populate the description. This is a technical description of the steps taken to process the material.
    # Should I use the study abstract to populate it instead?

    # One more question for PR. I was not able to find a way to retrieve "num_samples", "technology", "pre_print_doi", or "pre_print_title"
    # from the SRA api. Are these neccessary to retrieve automatically? If so, I may need to pair with someone to find out out how to get those.

    try:
        additional_metadata = {
            "study_id": metadata["study_accession"],
            "description": metadata["study_abstract"],
            "platform": metadata["platform_instrument_model"],
            "technology": metadata["library_strategy"],
            "num_samples": metadata["num_samples"],
        }

        material_json = {
            "organization": organization,
            "category": "DATASET",
            "imported": True,
            "import_source": "SRA",
            "title": metadata["study_title"],
            "organism": [metadata["organism_name"]],
            "url": ENA_URL_TEMPLATE.format(metadata["submission_accession"]),
            "contact_user": user,
            "additional_metadata": additional_metadata,
        }

        # Not all SRA objects will have a publication it seems. This accounts for that.
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

        if import_type == "SRA":
            return import_sra(request.data["run_accession"], organization, grant, request.user)
        else:
            return JsonResponse(
                {"error": f'Invalid value for parameter "import_type": {import_type}.'}, status=400
            )
