from rest_framework import status, viewsets
from rest_framework.exceptions import MethodNotAllowed, PermissionDenied, ValidationError
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Material, Organization, OrganizationMaterialAssociation
from resources_portal.views.material import MaterialSerializer
from resources_portal.views.relation_serializers import MaterialRelationSerializer


class OrganizationMaterialViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Material.objects.all().order_by("-created_at")

    http_method_names = ["get", "head", "options"]

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single Material by Organization.")

        return MaterialRelationSerializer
