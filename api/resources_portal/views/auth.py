from rest_framework import viewsets
from rest_framework.response import Response


class AuthorizationViewSet(viewsets.ViewSet):
    """
    Allows users to authenticate themselves with ORCID through OAuth.
    """

    def get(self, request):
        request.data["client_id"]

    # https://sandbox.orcid.org/oauth/authorize?
    # client_id=[Your client ID]&
    # response_type=code&
    # scope=/authenticate&
    # redirect_uri=[Your landing page]
