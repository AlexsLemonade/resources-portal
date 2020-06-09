import os

from django.contrib.auth import login
from django.shortcuts import redirect

import requests

from resources_portal.models.user import User

CLIENT_ID = ""


class OAuthMiddleWare:
    """ Intercepts requests containing a "code" parameter provided by ORCID OAuth.
    The authorization code is checked against ORCID and will provide a access token."""

    def process_request(self, request):
        if not ("code" in request.data.keys()):
            return None
        else:
            authorization_code = request.data["code"]

            data = {
                "client_id": CLIENT_ID,
                "client_secret": os.getenv("OAUTH_CLIENT_SECRET"),
                "grant_type": "authorization_code",
                "code": authorization_code,
                "redirect_uri": {{request.path}},
            }

            URL = "https://sandbox.orcid.org/oauth/token"
            response = requests.post(URL, data=data, headers={"accept": "application/json"})

            response.data["access_token"]
            response.data["refresh_token"]
            response.data["expires_in"]
            response.data["scope"]
            response.data["orcid"]
            response.data["name"]

            user_queryset = User.objects.filter(orcid=response.data["orcid"])

            if user_queryset.exists():
                user = user_queryset.first()
            else:
                user = User.objects.get(request.GET.get("user_id"))

                user.orcid = response.data["orcid"]
                user.save()

            login(request, user_queryset.first())

            return None
