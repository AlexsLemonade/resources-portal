from rest_framework import serializers, status, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Material, Organization, OrganizationMaterialAssociation
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
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class MaterialDetailSerializer(MaterialSerializer):
    contact_user = UserSerializer()


class HasAddResources(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("add_resources", obj.organization)


class MaterialViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Material.objects.all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MaterialDetailSerializer

        return MaterialSerializer

    def get_permissions(self):
        if (
            self.action == "create"
            or self.action == "update"
            or self.action == "partial_update"
            or self.action == "destroy"
        ):
            permission_classes = [HasAddResources, IsAuthenticated]
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

        response = super(MaterialViewSet, self).create(request, *args, **kwargs)

        organization = serializer.validated_data["organization"]
        material = Material.objects.get(pk=response.data["id"])
        OrganizationMaterialAssociation.objects.get_or_create(
            organization=organization, material=material
        )

        return response

    def update(self, request, *args, **kwargs):
        material = self.get_object()
        serializer = self.get_serializer(material, data=request.data)
        serializer.is_valid(raise_exception=True)

        new_organization = serializer.validated_data["organization"]

        if material.organization != new_organization:
            if not request.user.has_perm("add_resources", new_organization):
                return Response(status=status.HTTP_403_FORBIDDEN)
            else:
                OrganizationMaterialAssociation.objects.get(
                    material=material, organization=material.organization
                ).delete()
                OrganizationMaterialAssociation.objects.get_or_create(
                    organization=new_organization, material=material
                )

        return super(MaterialViewSet, self).update(request, *args, **kwargs)
