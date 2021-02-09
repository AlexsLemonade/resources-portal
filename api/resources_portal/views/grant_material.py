from rest_framework import viewsets
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Grant, GrantMaterialAssociation, Material
from resources_portal.serializers import MaterialRelationSerializer


class CanAccessGrant(BasePermission):
    def has_permission(self, request, view):
        grant = Grant.objects.get(pk=view.kwargs["parent_lookup_grants"])

        if request.user == grant.user:
            return True

        for organization in grant.organizations.all():
            if request.user in organization.members.all():
                return True

        return False


class CanAccessGrantAndMaterialOrIsOwner(BasePermission):
    def has_permission(self, request, view):
        grant = Grant.objects.get(pk=view.kwargs["parent_lookup_grants"])
        material = Material.objects.get(pk=view.kwargs["pk"])

        return (
            request.user in material.organization.members.all()
            and grant in material.organization.grants.all()
        ) or request.user == grant.user


class CanAddMaterialToGrant(BasePermission):
    def has_permission(self, request, view):
        grant = Grant.objects.get(pk=view.kwargs["parent_lookup_grants"])
        material = Material.objects.get(pk=request.data["id"])

        return (
            request.user in material.organization.members.all()
            and grant in material.organization.grants.all()
            and request.user.has_perm("add_resources", material.organization)
        )


class GrantMaterialViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Material.objects.all().order_by("-created_at")

    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single Material by Grant.")

        return MaterialRelationSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAuthenticated, CanAccessGrant]
        elif self.action == "create":
            permission_classes = [IsAuthenticated, CanAddMaterialToGrant]
        else:
            permission_classes = [IsAuthenticated, CanAccessGrantAndMaterialOrIsOwner]

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
