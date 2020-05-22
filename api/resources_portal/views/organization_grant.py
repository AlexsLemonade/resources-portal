from rest_framework import viewsets
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Grant, GrantOrganizationAssociation, Organization
from resources_portal.views.relation_serializers import GrantRelationSerializer


class IsMemberOfOrganization(BasePermission):
    def has_permission(self, request, view):
        organization = Organization.objects.get(pk=view.kwargs["parent_lookup_organizations"])

        return request.user in organization.members.all()


class OwnsGrantAndOrganization(BasePermission):
    def has_permission(self, request, view):
        grant = Grant.objects.get(pk=request.data["id"])
        organization = Organization.objects.get(pk=view.kwargs["parent_lookup_organizations"])

        return request.user in grant.users.all() and request.user == organization.owner


class OrganizationGrantViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Grant.objects.all().order_by("-created_at")

    http_method_names = ["post", "delete", "get", "head", "options"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single Grant by Organization.")

        return GrantRelationSerializer

    def get_permissions(self):
        if self.action == "create" or self.action == "delete":
            permission_classes = [IsAuthenticated, OwnsGrantAndOrganization]
        else:
            permission_classes = [IsAuthenticated, IsMemberOfOrganization]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        organization = Organization.objects.get(pk=kwargs["parent_lookup_organizations"])
        grant = Grant.objects.get(pk=request.data["id"])

        GrantOrganizationAssociation.objects.get_or_create(grant=grant, organization=organization)

        return Response(status=201)

    def destroy(self, request, *args, **kwargs):
        organization = Organization.objects.get(pk=kwargs["parent_lookup_organizations"])
        grant = Grant.objects.get(pk=request.data["id"])

        association = GrantOrganizationAssociation.objects.get(
            grant=grant, organization=organization
        )

        association.delete()

        return Response(status=204)
