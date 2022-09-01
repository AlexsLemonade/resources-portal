from django.conf import settings
from django.http import JsonResponse
from rest_framework import viewsets

import orcid
from django_expiring_token.authentication import token_expire_handler
from django_expiring_token.models import ExpiringToken

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.models.user import User

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


class LoginViewSet(viewsets.ViewSet):

    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        if "orcid" not in request.data:
            return JsonResponse(
                {"error": "orcid parameter was not found in the request."},
                status=400,
            )
        if "access_token" not in request.data:
            return JsonResponse(
                {"error": "access_token parameter was not found in the request."},
                status=400,
            )
        if "refresh_token" not in request.data:
            return JsonResponse(
                {"error": "refresh_token parameter was not found in the request."},
                status=400,
            )
        if not User.objects.filter(orcid=request.data["orcid"]).exists():
            return JsonResponse(
                {
                    "error": "A user with the provided ORCID does not exist.",
                    "USER_DOES_NOT_EXIST": True,
                },
                status=400,
            )

        # Use access token to retrieve ORCID from ORCID api to authenticate user
        api = orcid.PublicAPI(CLIENT_ID, CLIENT_SECRET, sandbox=IS_OAUTH_SANDBOX)

        summary = api.read_record_public(
            request.data["orcid"], "record", request.data["access_token"]
        )

        retrieved_orcid = summary["orcid-identifier"]["path"]

        user = User.objects.filter(orcid=retrieved_orcid).first()

        # Update access and refresh token with newly issued ones
        user.orcid_access_token = request.data["access_token"]
        user.orcid_refresh_token = request.data["refresh_token"]

        user.save()

        token = ExpiringToken.objects.get(user=user)

        is_expired, token = token_expire_handler(token)

        return JsonResponse(
            {"user_id": user.id, "token": token.key, "expires": token.expires},
            status=200,
        )
