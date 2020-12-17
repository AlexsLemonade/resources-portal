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
        if self.action == "update" or self.action == "partial_update" or self.action == "destroy":
            permission_classes = [IsAuthenticated, IsUserOrAdmin]
        elif self.action == "create":
            permission_classes = []
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if "orcid" not in request.data:
            return JsonResponse(
                {"error": "orcid parameter was not found in the request."}, status=400,
            )

        if "access_token" not in request.data:
            return JsonResponse(
                {"error": "access_token parameter was not found in the request."}, status=400,
            )
        if "refresh_token" not in request.data:
            return JsonResponse(
                {"error": "refresh_token parameter was not found in the request."}, status=400,
            )
        if User.objects.filter(orcid=request.data["orcid"]).exists():
            return JsonResponse(
                {
                    "error": "A user with the provided ORCID already exists.",
                    "error_code": "USER_EXISTS",
                },
                status=400,
            )

        try:
            api = orcid.PublicAPI(CLIENT_ID, CLIENT_SECRET, sandbox=IS_OAUTH_SANDBOX)

            summary = api.read_record_public(
                request.data["orcid"], "record", request.data["access_token"]
            )
        except Exception as error:
            return JsonResponse({"error": error}, status=500,)

        # check if email, first_name, last_name included in request
        email = request.data.get("email", None)
        first_name = request.data.get("first_name", None)
        last_name = request.data.get("last_name", None)

        emails = summary["person"]["emails"].get("email", None)
        name = summary["person"].get("name", None)

        # fall back to ORCID response
        if emails and not email:
            email = emails[0]["email"]

        if not first_name and name and name.get("given-names", None):
            first_name = name["given-names"]["value"]

        if not last_name and name and name.get("family-name", None):
            last_name = name["family-name"]["value"]

        # Return error if all are not available
        if not email or not first_name or not last_name:
            required = []

            if not first_name:
                required.append("first_name")
            if not last_name:
                required.append("last_name")
            if not email:
                required.append("email")

            return JsonResponse(
                {
                    "error": "There were details not provided on the provided ORCID record. Please provide missing details in the POST request.",
                    "required": required,
                },
                status=401,
            )

        try:
            user = User.objects.create(
                orcid=summary["orcid-identifier"]["path"],
                orcid_access_token=request.data["access_token"],
                orcid_refresh_token=request.data["refresh_token"],
                first_name=first_name,
                last_name=last_name,
                email=email,
            )
        except Exception as error:
            return JsonResponse({"error": error}, status=500,)

        org = Organization(owner=user, name="My Resources", is_personal_organization=True)
        org.save()
        user.personal_organization = org

        if "grants" in request.data:
            grant_json = request.data["grants"]

            for grant_info in grant_json:
                if "title" not in grant_info:
                    return JsonResponse(
                        {
                            "error": f"Attribute 'title' not found in provided json for user grant creation: {grant_json}",
                        },
                        status=400,
                    )
                if "funder_id" not in grant_info:
                    return JsonResponse(
                        {
                            "error": f"Attribute 'funder_id' not found in provided json for user grant creation: {grant_json}",
                        },
                        status=400,
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
