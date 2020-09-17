from django.db import transaction
from rest_framework import viewsets
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Grant, GrantOrganizationAssociation, Organization
from resources_portal.notifier import send_notifications
from resources_portal.serializers import GrantRelationSerializer


class IsMemberOfOrganization(BasePermission):
    def has_permission(self, request, view):
        organization = Organization.objects.get(pk=view.kwargs["parent_lookup_organizations"])

        return request.user in organization.members.all()


class OwnsGrantAndOrganization(BasePermission):
    def has_permission(self, request, view):

        organization = Organization.objects.get(pk=view.kwargs["parent_lookup_organizations"])

        # Check this early to avoid unnecessary DB call.
        if not request.user == organization.owner:
            return False

        if view.action == "create":
            grant = Grant.objects.get(pk=request.data["id"])
        else:
            grant = Grant.objects.get(pk=view.kwargs["pk"])

        return request.user == grant.user


class OwnsGrantOrOrganization(BasePermission):
    def has_permission(self, request, view):

        organization = Organization.objects.get(pk=view.kwargs["parent_lookup_organizations"])

        if view.action == "create":
            grant = Grant.objects.get(pk=request.data["id"])
        else:
            grant = Grant.objects.get(pk=view.kwargs["pk"])

        return request.user == grant.user or request.user == organization.owner


class OrganizationGrantViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Grant.objects.all().order_by("-created_at")

    http_method_names = ["post", "delete", "get", "head", "options"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single Grant by Organization.")

        return GrantRelationSerializer

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsAuthenticated, OwnsGrantAndOrganization]
        elif self.action == "destroy":
            permission_classes = [IsAuthenticated, OwnsGrantOrOrganization]
        else:
            permission_classes = [IsAuthenticated, IsMemberOfOrganization]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        organization = Organization.objects.get(pk=kwargs["parent_lookup_organizations"])
        grant = Grant.objects.get(pk=request.data["id"])

        GrantOrganizationAssociation.objects.get_or_create(grant=grant, organization=organization)

        send_notifications(
            "ORGANIZATION_NEW_GRANT", request.user, request.user, organization, grant=grant
        )

        return Response(status=201)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        organization = Organization.objects.get(pk=kwargs["parent_lookup_organizations"])
        grant = Grant.objects.get(pk=kwargs["pk"])

        if (
            "transfer" in request.query_params
            and request.query_params["transfer"].upper() == "TRUE"
        ):
            # Transfer materials to the grant owner's personal organization.
            personal_organization = grant.user.personal_organization

            for material in organization.materials.filter(grants__id__contains=grant.id):
                material.organization = personal_organization
                material.save()

        association = GrantOrganizationAssociation.objects.get(
            grant=grant, organization=organization
        )

        association.delete()

        return Response(status=204)
