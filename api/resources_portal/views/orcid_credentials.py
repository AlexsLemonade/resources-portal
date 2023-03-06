from django.conf import settings
from django.http import JsonResponse
from rest_framework import viewsets

import requests

from resources_portal.config.logging import get_and_configure_logger

logger = get_and_configure_logger(__name__)

CLIENT_ID = settings.CLIENT_ID
CLIENT_SECRET = settings.CLIENT_SECRET
OAUTH_URL = settings.OAUTH_URL
IS_OAUTH_SANDBOX = "sandbox" in OAUTH_URL


def remove_code_parameter_from_uri(url):
    """
    This removes the "code" parameter added by the first ORCID call if it is there,
     and trims off the trailing '/?' if it is there.
    """
    return url.split("code")[0].strip("&").strip("/?")


class ORCIDCredentialsViewSet(viewsets.ViewSet):

    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        if "code" not in request.data:
            return JsonResponse(
                {"error": "Code parameter was not found in the request."},
                status=400,
            )
        elif "origin_url" not in request.data:
            return JsonResponse(
                {
                    "error": f"Origin URL parameter was not found in the URL: {request.build_absolute_uri()}"
                },
                status=400,
            )

        authorization_code = request.data["code"]
        origin_url = request.data["origin_url"]

        data = {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": authorization_code,
            "redirect_uri": remove_code_parameter_from_uri(origin_url),
        }

        try:
            # get user orcid info
            response = requests.post(OAUTH_URL, data=data, headers={"accept": "application/json"})
            response_json = response.json()
        except Exception as error:
            return JsonResponse(
                {"error": error},
                status=500,
            )

        if "orcid" not in response_json:
            return JsonResponse(response_json, status=400)

        return JsonResponse(
            {
                "orcid": response_json["orcid"],
                "access_token": response_json["access_token"],
                "refresh_token": response_json["refresh_token"],
            },
            status=200,
        )
