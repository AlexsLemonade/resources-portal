import os
import xml.etree.ElementTree as ET

from django.contrib.auth import login
from django.shortcuts import redirect
from rest_framework.response import Response

import furl
import orcid
import requests

from resources_portal.models.grant import Grant
from resources_portal.models.user import User

CLIENT_ID = "APP-2AHZAK2XCFGHRJFM"
CLIENT_SECRET = "1aaa0a94-5605-4cd8-95a4-6724c2f7fd42"

# os.getenv("OAUTH_CLIENT_SECRET"),
# Need to set up this secret on the github.
# Kurt, a little help with this?


def remove_code_parameter_from_uri(url):
    url_obj = furl.furl(url)
    url_obj.remove(["code"])
    return url_obj.url


class OAuthMiddleWare:

    """ Intercepts requests containing a "code" parameter provided by ORCID OAuth.
    The authorization code is checked against ORCID and will provide a access token."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not ("code" in request.GET.keys()):
            response = self.get_response(request)
            return response
        else:
            authorization_code = request.GET["code"]

            # remove code param from uri so the redirect_uris will match
            uri = remove_code_parameter_from_uri(request.build_absolute_uri())

            data = {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": authorization_code,
                "redirect_uri": uri,
            }

            # get user orcid info
            URL = "https://sandbox.orcid.org/oauth/token"
            response = requests.post(URL, data=data, headers={"accept": "application/json"})
            response_json = response.json()

            user_queryset = User.objects.filter(orcid=response_json["orcid"])

            # Create user if neccessary
            if user_queryset.exists():
                user = user_queryset.first()
            else:
                email = request.GET.get("email")

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
                    access_token=response_json["access_token"],
                    refresh_token=response_json["refresh_token"],
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                )

                grant_ids = request.GET.getlist("grant_id")

                for grant in Grant.objects.filter(id__in=grant_ids):
                    user.grants.add(grant)

                user.save()

            # login user
            login(
                request, user_queryset.first(), backend="django.contrib.auth.backends.ModelBackend"
            )

            response = self.get_response(request)
            return response


class OAuthRejectedMiddleWare:

    """ Rejects requests which are unauthorized"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not ("error" in request.GET.keys()):
            response = self.get_response(request)
            return response
        else:
            error = request.GET["error"]
            return Response(error)
