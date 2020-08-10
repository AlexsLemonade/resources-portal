import urllib
from datetime import datetime

from django.conf import settings
from django.contrib.auth import login
from django.http import JsonResponse
from rest_framework import viewsets

import furl
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


class AuthViewSet(viewsets.ViewSet):

    http_method_names = ["get"]

    def retrieve(self, request, *args, **kwargs):
        if "code" not in request.GET:
            return JsonResponse(
                {
                    "error": f"Code parameter was not found in the URL: {request.build_absolute_uri()}"
                },
                status=400,
            )
        elif "origin_url" not in request.GET:
            return JsonResponse(
                {
                    "error": f"Origin URL parameter was not found in the URL: {request.build_absolute_uri()}"
                },
                status=400,
            )

        print("EIHDEWDFWENDKEDNEDNEKDNEKFEBFKEJFBEKFBE")

        authorization_code = request.GET["code"]
        origin_url = request.GET["origin_url"]
        email = request.GET["email"]

        data = {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": authorization_code,
            "redirect_uri": origin_url,
        }

        # get user orcid info
        response = requests.post(OAUTH_URL, data=data, headers={"accept": "application/json"})
        response_json = response.json()
        if "orcid" not in response_json:
            return JsonResponse(response_json, status=400)

        user = User.objects.filter(orcid=response_json["orcid"]).first()

        # Create user if neccessary
        if not user:
            email = request.GET["email"]

            print(response_json, "********************")

            # Get first and last name
            api = orcid.PublicAPI(CLIENT_ID, CLIENT_SECRET, sandbox=True)
            summary = api.read_record_public(
                response_json["orcid"], "person", response_json["access_token"]
            )
            first_name = summary["name"]["given-names"]["value"]
            last_name = summary["name"]["family-name"]["value"]

            user = User.objects.create(
                username=response_json["name"],
                orcid=response_json["orcid"],
                orcid_access_token=response_json["access_token"],
                orcid_refresh_token=response_json["refresh_token"],
                first_name=first_name,
                last_name=last_name,
                email=email,
            )

            org = Organization.objects.create(owner=user)
            user.organizations.add(org)

            grant_ids = request.GET.getlist("grant_id")

            for grant in Grant.objects.filter(id__in=grant_ids):
                user.grants.add(grant)

            user.save()

        token = ExpiringToken.objects.get(user=user)

        is_expired, token = token_expire_handler(token)

        return JsonResponse({"token": token.key, "expires": token.expires}, status=200,)
