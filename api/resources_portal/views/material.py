from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Material, MaterialShareEvent, Organization
from resources_portal.notifier import send_notifications
from resources_portal.serializers.material import (
    MaterialDetailSerializer,
    MaterialListSerializer,
    MaterialSerializer,
)
from resources_portal.views.material_request import MaterialRequestSerializer


class HasAddResources(BasePermission):
    def has_permission(self, request, view):
        if "organization" not in request.data:
            return False

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
    filterset_fields = (
        "id",
        "category",
        "pubmed_id",
        "is_archived",
        "needs_irb",
        "needs_abstract",
        "imported",
        "import_source",
        "pre_print_doi",
        "organization__id",
    )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MaterialDetailSerializer
        elif self.action == "list":
            return MaterialListSerializer

        return MaterialSerializer

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsAuthenticated, HasAddResources]
        elif self.action == "destroy":
            permission_classes = [IsAuthenticated, HasDeleteResources]
        elif self.action == "update" or self.action == "partial_update":
            permission_classes = [IsAuthenticated, HasEditResources]
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

        response = super(MaterialViewSet, self).create(request, *args, **kwargs)

        if "id" in response.data:
            material = Material.objects.get(pk=response.data["id"])
            send_notifications(
                "MATERIAL_ADDED",
                request.user,
                request.user,
                material.organization,
                material=material,
            )

        return response

    def update(self, request, *args, **kwargs):
        material = self.get_object()
        serializer = self.get_serializer(material, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        def field_changed(field_name):
            return field_name in request.data and serializer.validated_data[field_name] != getattr(
                material, field_name
            )

        if field_changed("category"):
            raise ValidationError("Category cannot be changed after a material is created.")

        if field_changed("organization"):
            if not request.user.has_perm(
                "add_resources", serializer.validated_data["organization"]
            ):
                return Response(status=status.HTTP_403_FORBIDDEN)

        if field_changed("mta_attachment"):
            MaterialShareEvent(
                event_type="MATERIAL_MTA_REQUIREMENTS_CHANGED",
                material=material,
                created_by=request.user,
            ).save()

        if field_changed("needs_irb"):
            MaterialShareEvent(
                event_type="MATERIAL_IRB_REQUIREMENTS_CHANGED",
                material=material,
                created_by=request.user,
            ).save()

        if field_changed("needs_abstract"):
            MaterialShareEvent(
                event_type="MATERIAL_ABSTRACT_REQUIREMENTS_CHANGED",
                material=material,
                created_by=request.user,
            ).save()

        if field_changed("shipping_requirement"):
            MaterialShareEvent(
                event_type="MATERIAL_SHIPPING_REQUIREMENTS_CHANGED",
                material=material,
                created_by=request.user,
            ).save()

        response = super(MaterialViewSet, self).update(request, *args, **kwargs)

        if not material.is_archived and request.data.get("is_archived", False):
            material = self.get_object()
            send_notifications(
                "MATERIAL_ARCHIVED",
                request.user,
                request.user,
                material.organization,
                material=material,
            )

        return response

    def destroy(self, request, *args, **kwargs):
        material = self.get_object()

        if material.requests.count() > 0:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={"message": "You cannot delete a material that has requests."},
            )

        response = super(MaterialViewSet, self).destroy(request, *args, **kwargs)

        send_notifications(
            "MATERIAL_DELETED",
            request.user,
            request.user,
            material.organization,
            material=material,
        )

        return response
