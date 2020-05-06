from rest_framework import serializers, viewsets
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Grant, GrantMaterialAssociation, Material
from resources_portal.views.relation_serializers import (
    GrantRelationSerializer,
    MaterialRelationSerializer,
)
from resources_portal.views.user import UserSerializer


class GrantMaterialViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Material.objects.all()

    http_method_names = ["get", "post", "delete", "head"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single Material by Grant.")

        return MaterialRelationSerializer

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
