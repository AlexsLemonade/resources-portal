from rest_framework import serializers, viewsets

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Material
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


class MaterialViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Material.objects.all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MaterialDetailSerializer

        return MaterialSerializer
