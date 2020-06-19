import os
import urllib

from django.conf import settings
from django.contrib.auth import login

import furl
import orcid
import requests

from resources_portal.models.grant import Grant
from resources_portal.models.organization import Organization
from resources_portal.models.user import User

CLIENT_ID = settings.CLIENT_ID
CLIENT_SECRET = settings.CLIENT_SECRET


def remove_code_parameter_from_uri(url):
    url_obj = furl.furl(url)
    url_obj.remove(["code"])
    return urllib.parse.unquote(url_obj.url)


class OAuthMiddleWare:

    """ Intercepts requests containing a "code" parameter provided by ORCID OAuth.
    The authorization code is checked against ORCID and will provide an access token."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if "code" not in request.GET.keys():
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

                Organization.objects.create(owner=user)

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
