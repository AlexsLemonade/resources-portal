from rest_framework import viewsets
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Material
from resources_portal.views.relation_serializers import MaterialRelationSerializer


class OrganizationMaterialViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Material.objects.all().order_by("-created_at")

    http_method_names = ["get", "head", "options"]

    permission_classes = []

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single Material by Organization.")

        return MaterialRelationSerializer
