from rest_framework import serializers, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Material, Organization
from resources_portal.views.relation_serializers import (
    AttachmentRelationSerializer,
    ShippingRequirementsRelationSerializer,
)
from resources_portal.views.user import UserSerializer


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = (
            "id",
            "category",
            "title",
            "url",
            "organization",
            "pubmed_id",
            "additional_metadata",
            "contact_user",
            "mta_attachment",
            "needs_mta",
            "needs_irb",
            "needs_abstract",
            "imported",
            "shipping_requirements",
            "import_source",
            "grants",
            "publication_title",
            "pre_print_doi",
            "pre_print_title",
            "citation",
            "additional_info",
            "embargo_date",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class MaterialDetailSerializer(MaterialSerializer):
    contact_user = UserSerializer()
    mta_attachment = AttachmentRelationSerializer()
    shipping_requirements = ShippingRequirementsRelationSerializer()


class HasAddResources(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("add_resources", obj.organization)


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
        serializer = self.get_serializer(material, data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data["category"] != material.category:
            raise ValidationError("Category cannot be changed after a material is created.")

        new_organization = serializer.validated_data["organization"]

        if material.organization != new_organization:
            if not request.user.has_perm("add_resources", new_organization):
                return Response(status=status.HTTP_403_FORBIDDEN)

        return super(MaterialViewSet, self).update(request, *args, **kwargs)
