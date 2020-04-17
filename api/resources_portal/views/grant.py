from django.http import HttpResponse, HttpResponseNotAllowed
from rest_framework import serializers, viewsets
from rest_framework.renderers import JSONRenderer

from resources_portal.models import Grant, GrantMaterialAssociation, Material, User
from resources_portal.views.relation_serializers import (
    MaterialRelationSerializer,
    OrganizationRelationSerializer,
    UserRelationSerializer,
)


class GrantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grant
        fields = (
            "id",
            "title",
            "funder_id",
            "users",
            "organizations",
            "materials",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class GrantDetailSerializer(GrantSerializer):
    users = UserRelationSerializer(many=True, read_only=True)
    organizations = OrganizationRelationSerializer(many=True, read_only=True)
    materials = MaterialRelationSerializer(many=True, read_only=True)


class GrantListSerializer(GrantSerializer):
    users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    organizations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    materials = serializers.PrimaryKeyRelatedField(many=True, read_only=True)


def grant_material_relationship(request, *args, **kwargs):
    grant = Grant.objects.get(pk=kwargs["pk"])
    material = Material.objects.get(pk=kwargs["material_id"])

    if request.method == "POST":
        GrantMaterialAssociation.objects.get_or_create(grant=grant, material=material)
    elif request.method == "DELETE":
        association = GrantMaterialAssociation.objects.get(grant=grant, material=material)
        association.delete()
    else:
        return HttpResponseNotAllowed(["POST", "DELETE"])

    return HttpResponse()


def list_grant_material_relationships(request, *args, **kwargs):

    if request.method == "GET":
        grant = Grant.objects.get(pk=kwargs["pk"])
        serializer = MaterialRelationSerializer(grant.materials, many=True)
        json = JSONRenderer().render(serializer.data)
        return HttpResponse(json, content_type="application/json")
    else:
        return HttpResponseNotAllowed(["GET"])

    return HttpResponse()


class GrantViewSet(viewsets.ModelViewSet):
    queryset = Grant.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return GrantListSerializer

        return GrantDetailSerializer
