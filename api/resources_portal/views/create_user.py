from django.conf import settings
from django.http import JsonResponse
from rest_framework import viewsets

import orcid
import requests
from django_expiring_token.authentication import token_expire_handler
from django_expiring_token.models import ExpiringToken

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.models.grant import Grant
from resources_portal.models.organization import Organization
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


class CreateUserViewSet(viewsets.ViewSet):

    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        print(request.data)
        if "orcid" not in request.data:
            return JsonResponse(
                {"error": f"orcid parameter was not found in the request."}, status=400,
            )
        if "access_token" not in request.data:
            return JsonResponse(
                {"error": f"access_token parameter was not found in the request."}, status=400,
            )
        if "refresh_token" not in request.data:
            return JsonResponse(
                {"error": f"refresh_token parameter was not found in the request."}, status=400,
            )
        if User.objects.filter(orcid=request.data["orcid"]).exists():
            return JsonResponse(
                {"error": f"A user with the provided ORCID already exists."}, status=400,
            )

        api = orcid.PublicAPI(CLIENT_ID, CLIENT_SECRET, sandbox=IS_OAUTH_SANDBOX)

        summary = api.read_record_public(
            request.data["orcid"], "record", request.data["access_token"]
        )

        email = ""

        if "email" in request.data:
            email = request.data["email"]
        else:
            if len(summary["person"]["emails"]["email"]) == 0:
                return JsonResponse(
                    {
                        "error": "There were no emails made availible on the provided ORCID record. Please provide an email in the POST request.",
                        "needs_email": True,
                    },
                    status=401,
                )

            # Use the email first added to the ORCID account
            email = summary["person"]["emails"]["email"][0]["email"]

        # Get first and last name

        first_name = summary["person"]["name"]["given-names"]["value"]
        last_name = summary["person"]["name"]["family-name"]["value"]

        user = User.objects.create(
            orcid=summary["orcid-identifier"]["path"],
            orcid_access_token=request.data["access_token"],
            orcid_refresh_token=request.data["refresh_token"],
            first_name=first_name,
            last_name=last_name,
            email=email,
        )

        org = Organization.objects.create(owner=user)
        user.personal_organization = org

        if "grant_info" in request.data:
            grant_json = request.data["grant_info"]

            for grant_info in grant_json:
                if not grant_info["title"]:
                    logger.error(
                        f"Attribute 'title' not found in provided json for user grant creation: {grant_info}"
                    )
                if not grant_info["funder_id"]:
                    logger.error(
                        f"Attribute 'funder_id' not found in provided json for user grant creation: {grant_info}"
                    )

                grant = Grant.objects.create(
                    title=grant_info["title"], funder_id=grant_info["funder_id"], user=user
                )
                user.grants.add(grant)

        user.save()

        token = ExpiringToken.objects.get(user=user)

        is_expired, token = token_expire_handler(token)

        return JsonResponse(
            {"user_id": user.id, "token": token.key, "expires": token.expires}, status=200,
        )
