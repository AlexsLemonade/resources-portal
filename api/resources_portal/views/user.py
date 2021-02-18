from django.conf import settings
from django.http import JsonResponse
from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated

import orcid
from django_expiring_token.authentication import token_expire_handler
from django_expiring_token.models import ExpiringToken

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.models import User
from resources_portal.models.grant import Grant
from resources_portal.models.organization import Organization
from resources_portal.serializers import (
    AttachmentRelationSerializer,
    GrantRelationSerializer,
    MaterialRequestRelationSerializer,
    OrganizationInvitationRelationSerializer,
    OrganizationRelationSerializer,
)
from resources_portal.views.address import AddressSerializer

logger = get_and_configure_logger(__name__)

CLIENT_ID = settings.CLIENT_ID
CLIENT_SECRET = settings.CLIENT_SECRET
OAUTH_URL = settings.OAUTH_URL
IS_OAUTH_SANDBOX = "sandbox" in OAUTH_URL


PRIVATE_FIELDS = [
    "addresses",
    "material_requests",
    "invitations",
    "assignments",
    "viewed_notifications_at",
    "owned_attachments",
]


def remove_code_parameter_from_uri(url):
    """
    This removes the "code" parameter added by the first ORCID call if it is there,
     and trims off the trailing '/?' if it is there.
    """
    return url.split("code")[0].strip("&").strip("/?")


def get_unset_keys(dictionary, keys):
    """
    This is a utility that takes a dictionary and a list of keys
     and returns any keys with no value or missing from the dict.
    """
    return [k for k in keys if k not in dictionary or not dictionary[k]]


def get_nested_key(dictionary, *keys):
    """
    This dives into a dictionary or list without throwing a AttributeError or KeyError
    """
    value = dictionary
    try:
        for key in keys:
            value = value[key]
    except Exception:
        return None
    return value


def parse_orcid_response(response):
    """
    This safely digs into the ORCID user summary response and returns consistent dict
     representation independent of the user's visibility settings.
    """
    return {
        "orcid": get_nested_key(response, "orcid-identifier", "path"),
        "email": get_nested_key(response, "person", "emails", "email", 0, "email"),
        "first_name": get_nested_key(response, "person", "name", "given-names", "value"),
        "last_name": get_nested_key(response, "person", "name", "family-name", "value"),
    }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "orcid",
            "viewed_notifications_at",
            "owned_attachments",
            "material_requests",
            "grants",
            "invitations",
            "organizations",
            "owned_organizations",
            "public_organizations",
            "owned_public_organizations",
            "personal_organization",
            "assignments",
            "addresses",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "username",
            "created_at",
            "updated_at",
            "attachments",
            "material_requests",
            "grants",
            "invitations",
            "assignments",
            "organizations",
            "addresses",
            "owned_organizations",
            "public_organizations",
            "owned_public_organizations",
            "personal_organization",
        )

    owned_attachments = AttachmentRelationSerializer(many=True, read_only=True)
    organizations = OrganizationRelationSerializer(many=True, read_only=True)
    personal_organization = OrganizationRelationSerializer(read_only=True)
    owned_organizations = OrganizationRelationSerializer(many=True, read_only=True)
    public_organizations = OrganizationRelationSerializer(many=True, read_only=True)
    owned_public_organizations = OrganizationRelationSerializer(many=True, read_only=True)
    material_requests = MaterialRequestRelationSerializer(many=True, read_only=True)
    grants = GrantRelationSerializer(many=True, read_only=True)
    assignments = MaterialRequestRelationSerializer(many=True, read_only=True)
    invitations = OrganizationInvitationRelationSerializer(many=True, read_only=True)
    addresses = serializers.SerializerMethodField()

    def get_addresses(self, obj):
        queryset = obj.addresses.filter(saved_for_reuse=True)

        return AddressSerializer(queryset, many=True, read_only=True).data

    def to_representation(self, request_data):
        # get the original representation
        user_data = super(UserSerializer, self).to_representation(request_data)
        if str(self.context["request"].user.id) != user_data["id"]:
            for field in PRIVATE_FIELDS:
                if field in user_data:
                    user_data.pop(field)

        return user_data


class IsUserOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj or request.user.is_staff


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    http_method_names = ["get", "post", "delete", "put", "patch", "head", "options"]

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            permission_classes = [IsAuthenticated, IsUserOrAdmin]
        elif self.action == "create":
            permission_classes = []
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        grants = request.data.get("grants", [])
        missing_params = get_unset_keys(request.data, ["orcid", "access_token", "refresh_token"])
        malformed_grants = [g for g in grants if get_unset_keys(g, ["title", "funder_id"])]

        if missing_params or malformed_grants:
            return JsonResponse(
                {
                    "error": "Please check that all required parameters are present and correct in request.",
                    "missing_parameters": missing_params,
                    "malformed_grants": malformed_grants,
                },
                status=400,
            )

        if User.objects.filter(orcid=request.data["orcid"]).exists():
            return JsonResponse(
                {
                    "error": "A user with the provided ORCID already exists.",
                    "error_code": "USER_EXISTS",
                },
                status=409,
            )

        try:
            api = orcid.PublicAPI(CLIENT_ID, CLIENT_SECRET, sandbox=IS_OAUTH_SANDBOX)

            orcid_response = api.read_record_public(
                request.data["orcid"], "record", request.data["access_token"]
            )
            orcid_data = parse_orcid_response(orcid_response)
        except Exception as error:
            return JsonResponse({"error": error}, status=500,)

        # use request data fallback to parsed orcid data
        user_data = {
            "orcid": orcid_data["orcid"],
            "orcid_access_token": request.data.get("access_token", None),
            "orcid_refresh_token": request.data.get("refresh_token", None),
            "first_name": request.data.get("first_name", orcid_data["first_name"]),
            "last_name": request.data.get("last_name", orcid_data["last_name"]),
            "email": request.data.get("email", orcid_data["email"]),
        }

        # check if missing param should be passed up
        missing_data = get_unset_keys(user_data, ["email", "first_name", "last_name"])

        if missing_data:
            return JsonResponse(
                {
                    "error": "There were details not provided on the provided ORCID record. Please provide missing details in the POST request.",
                    "required": missing_data,
                },
                status=422,
            )

        # create user and related resources
        try:
            user = User.objects.create(**user_data)
        except Exception as error:
            return JsonResponse({"error": error}, status=500)

        org = Organization.objects.create(
            owner=user, name=user.full_name, is_personal_organization=True
        )
        user.personal_organization = org

        for g in grants:
            grant = Grant.objects.create(**g, user=user)
            user.grants.add(grant)

        user.save()

        existing_token = ExpiringToken.objects.get(user=user)

        is_expired, token = token_expire_handler(existing_token)

        return JsonResponse(
            {"user_id": user.id, "token": token.key, "expires": token.expires}, status=200,
        )
