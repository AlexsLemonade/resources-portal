from rest_framework import viewsets
from rest_framework.exceptions import MethodNotAllowed, PermissionDenied, ValidationError
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Organization, OrganizationUserAssociation, User
from resources_portal.views.relation_serializers import UserRelationSerializer


class BelongsToOrganization(BasePermission):
    def has_permission(self, request, view):
        organization = Organization.objects.get(pk=view.kwargs["parent_lookup_organization"])

        return request.user in organization.members.all()


class OrganizationMemberViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-created_at")
    permission_classes = [IsAuthenticated, BelongsToOrganization]

    http_method_names = ["get", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single User by Organization.")

        return UserRelationSerializer

    def destroy(self, request, *args, **kwargs):
        user = User.objects.get(pk=kwargs["pk"])
        organization = Organization.objects.get(pk=kwargs["parent_lookup_organization"])

        if user == organization.owner:
            raise ValidationError(detail="An owner may not be removed from their organization.")

        if not (request.user == organization.owner or request.user == user):
            raise PermissionDenied(
                detail="Only the owner may remove members from an organization, "
                "unless the member is removing themself."
            )

        association = OrganizationUserAssociation.objects.get(organization=organization, user=user)

        association.delete()
        organization.remove_member_perms(user)

        return Response(status=204)
