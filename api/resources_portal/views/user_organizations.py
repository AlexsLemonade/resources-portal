from rest_framework import viewsets
from rest_framework.exceptions import MethodNotAllowed, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.config.logging import get_and_configure_logger
from resources_portal.models import Organization, OrganizationUserAssociation, User
from resources_portal.views.relation_serializers import OrganizationRelationSerializer

logger = get_and_configure_logger(__name__)


class UserOrganizationViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Organization.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated]

    http_method_names = ["get", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single Organization by User.")

        return OrganizationRelationSerializer

    def destroy(self, request, *args, **kwargs):
        organization = Organization.objects.get(pk=kwargs["pk"])
        user = User.objects.get(pk=kwargs["parent_lookup_user"])

        if user == organization.owner:
            raise ValidationError(detail="An owner may not be removed from their organization.")

        if not (request.user == organization.owner or request.user == user):
            raise PermissionDenied(
                detail="Only the owner may remove members from an organization, "
                "unless the member is removing themself."
            )

        association = OrganizationUserAssociation.objects.get(organization=organization, user=user)

        association.delete()

        return Response(status=204)
