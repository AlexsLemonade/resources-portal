from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from ..models import Material
from ..serializers import MaterialSerializer


class MaterialViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
