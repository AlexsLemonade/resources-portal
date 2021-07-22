from rest_framework import serializers

from resources_portal.models import Material
from resources_portal.serializers.relation_serializers import (
    AttachmentRelationSerializer,
    GrantRelationSerializer,
    OrganizationRelationSerializer,
    ShippingRequirementRelationSerializer,
    UserRelationSerializer,
)


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = (
            "id",
            "category",
            "title",
            "url",
            "organisms",
            "organization",
            "pubmed_id",
            "is_archived",
            "additional_metadata",
            "contact_user",
            "sequence_maps",
            "mta_attachment",
            "needs_mta",
            "has_publication",
            "needs_irb",
            "needs_abstract",
            "imported",
            "shipping_requirement",
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
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "sequence_maps",
            "requests",
            "needs_mta",
            "has_publication",
            "grants",
        )

    def validate(self, data):
        """Only allow materials with no open requests to be archived."""
        # If they aren't setting is_archived=True on an existing
        # material then they're fine.
        if "id" not in data or "is_archived" not in data or not data["is_archived"]:
            return data

        material = Material.objects.get(data["id"])
        for request in material.requests:
            if request.status not in ["REJECTED", "INVALID", "CANCELLED", "FULFILLED"]:
                raise serializers.ValidationError(
                    "All requests for the material must be closed first."
                )

        return data


class MaterialListSerializer(MaterialSerializer):
    mta_attachment = AttachmentRelationSerializer()
    shipping_requirement = ShippingRequirementRelationSerializer()
    grants = GrantRelationSerializer(many=True)


class MaterialDetailSerializer(MaterialListSerializer):
    contact_user = UserRelationSerializer()
    sequence_maps = AttachmentRelationSerializer(many=True)
    organization = OrganizationRelationSerializer()
    grants = GrantRelationSerializer(many=True)
