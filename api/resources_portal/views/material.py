from django.shortcuts import get_object_or_404
from rest_framework import serializers, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Material, Organization
from resources_portal.views.material_request import MaterialRequestSerializer
from resources_portal.views.relation_serializers import (
    AttachmentRelationSerializer,
    ShippingRequirementRelationSerializer,
    UserRelationSerializer,
)


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = (
            "id",
            "category",
            "title",
            "url",
            "organisms",
            "organization",
            "pubmed_id",
            "is_archived",
            "additional_metadata",
            "contact_user",
            "sequence_maps",
            "mta_attachment",
            "needs_mta",
            "needs_irb",
            "needs_abstract",
            "imported",
            "shipping_requirement",
            "import_source",
            "grants",
            "organisms",
            "publication_title",
            "pre_print_doi",
            "pre_print_title",
            "citation",
            "additional_info",
            "embargo_date",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "sequence_maps", "requests")

    def validate(self, data):
        """Only allow materials with no open requests to be archived.
        """
        # If they aren't setting is_archived=True on an existing
        # material then they're fine.
        if "id" not in data or "is_archived" not in data or not data["is_archived"]:
            return data

        material = Material.objects.get(data["id"])
        for request in material.requests:
            if request.status not in ["REJECTED", "INVALID", "CANCELLED", "FULFILLED"]:
                raise serializers.ValidationError(
                    "All requests for the material must be closed first."
                )

        return data


class MaterialDetailSerializer(MaterialSerializer):
    contact_user = UserRelationSerializer()
    mta_attachment = AttachmentRelationSerializer()
    shipping_requirement = ShippingRequirementRelationSerializer()
    sequence_maps = AttachmentRelationSerializer(many=True)


class HasAddResources(BasePermission):
    def has_permission(self, request, view):
        organization = Organization.objects.get(id=request.data["organization"])
        return request.user.has_perm("add_resources", organization)


class HasDeleteResources(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("delete_resources", obj.organization)


class HasEditResources(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("edit_resources", obj.organization)


class MaterialViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Material.objects.all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MaterialDetailSerializer

        return MaterialSerializer

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [HasAddResources, IsAuthenticated]
        elif self.action == "destroy":
            permission_classes = [HasDeleteResources, IsAuthenticated]
        elif self.action == "update" or self.action == "partial_update":
            permission_classes = [HasEditResources, IsAuthenticated]
        else:
            permission_classes = []

        return [permission() for permission in permission_classes]

    def retrieve(self, request, pk=None):
        """Retrieve requests manually so we can filter to ones the user has perms for."""
        material = get_object_or_404(self.queryset, pk=pk)
        serializer = MaterialDetailSerializer(material)

        response_data = serializer.data

        if request.user.id:
            requests_queryset = serializer.instance.requests
            if serializer.instance.organization.members.filter(id=request.user.id).count() < 1:
                requests_queryset = requests_queryset.filter(requester=request.user)

            requests_serializer = MaterialRequestSerializer(requests_queryset, many=True)
            response_data["requests"] = requests_serializer.data

        return Response(response_data)

    def create(self, request, *args, **kwargs):
        serializer = MaterialSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.has_perm(
            "add_resources", Organization.objects.get(pk=request.data["organization"])
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)

        return super(MaterialViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        material = self.get_object()
        serializer = self.get_serializer(material, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if (
            "category" in serializer.validated_data
            and serializer.validated_data["category"] != material.category
        ):
            raise ValidationError("Category cannot be changed after a material is created.")

        new_organization = serializer.validated_data["organization"]

        if material.organization != new_organization:
            if not request.user.has_perm("add_resources", new_organization):
                return Response(status=status.HTTP_403_FORBIDDEN)

        return super(MaterialViewSet, self).update(request, *args, **kwargs)
