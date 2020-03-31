from rest_framework import serializers

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
