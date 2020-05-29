from rest_framework import serializers

from resources_portal.models import Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            "id",
            "created_at",
            "updated_at",
            "filename",
            "description",
            "s3_bucket",
            "s3_key",
            "sequence_map_for",
            "deleted",
        )
        read_only_fields = ("id", "created_at", "updated_at")
