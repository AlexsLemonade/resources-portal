from rest_framework import mixins, serializers, viewsets

from resources_portal.models import Material


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = (
            "id",
            "url",
            "pubmed_id",
            "metadata",
            "primary_contact",
            "created_at",
            "updated_at",
        )
        read_only_fields = ()


class MaterialViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
