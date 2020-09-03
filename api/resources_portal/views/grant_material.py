from rest_framework import viewsets
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Grant, GrantMaterialAssociation, Material
from resources_portal.views.relation_serializers import MaterialRelationSerializer


class OwnsGrant(BasePermission):
    def has_permission(self, request, view):
        grant = Grant.objects.get(pk=view.kwargs["parent_lookup_grants"])

        return request.user == grant.user


class OwnsGrantAndMaterial(BasePermission):
    def has_permission(self, request, view):
        grant = Grant.objects.get(pk=view.kwargs["parent_lookup_grants"])
        material = Material.objects.get(pk=request.data["id"])

        # Check the grant here instead of with OwnsGrant because we
        # need to query for the Grant here anyway so we may as well
        # use it rather than querying for it a second time in
        # OwnsGrant.
        return (
            request.user == grant.user
            and request.user in material.organization.members.all()
            and grant in material.organization.grants.all()
        )


class GrantMaterialViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Material.objects.all().order_by("-created_at")

    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single Material by Grant.")

        return MaterialRelationSerializer

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsAuthenticated, OwnsGrantAndMaterial]
        else:
            permission_classes = [IsAuthenticated, OwnsGrant]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        material = Material.objects.get(pk=request.data["id"])
        grant = Grant.objects.get(pk=kwargs["parent_lookup_grants"])

        GrantMaterialAssociation.objects.get_or_create(grant=grant, material=material)

        return Response(status=201)

    def destroy(self, request, *args, **kwargs):
        material = Material.objects.get(pk=kwargs["pk"])
        grant = Grant.objects.get(pk=kwargs["parent_lookup_grants"])

        association = GrantMaterialAssociation.objects.get(grant=grant, material=material)

        association.delete()

        return Response(status=204)
