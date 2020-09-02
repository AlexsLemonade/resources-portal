"""This file houses serializers which can be used for nested relationships.

These serializers do not use nested relationships themselves, so that
if a grant object links to a user and the user links to the grant, the
JSON won't recur infinitely. For any relationships, these serializers
will use PrimaryKeyRelatedFields.
"""

from rest_framework import serializers

from resources_portal.models import (
    Address,
    Attachment,
    FulfillmentNote,
    Grant,
    Material,
    MaterialRequest,
    MaterialShareEvent,
    Organization,
    OrganizationInvitation,
    ShippingRequirement,
    User,
)


class UserRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "full_name",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {"id": {"read_only": False}}


class OrganizationRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "owner",
            "members",
            "created_at",
            "updated_at",
        )

    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    members = serializers.PrimaryKeyRelatedField(many=True, read_only=True)


class MaterialRelationSerializer(serializers.ModelSerializer):
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
        ordering = ["-created_at"]

    organization = serializers.PrimaryKeyRelatedField(read_only=True)
    contact_user = serializers.PrimaryKeyRelatedField(read_only=True)


class GrantRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grant
        fields = (
            "id",
            "title",
            "funder_id",
            "user",
            "organizations",
            "materials",
            "created_at",
            "updated_at",
        )

    user = serializers.PrimaryKeyRelatedField(read_only=True)
    organizations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    materials = serializers.PrimaryKeyRelatedField(many=True, read_only=True)


class AttachmentRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = (
            "id",
            "filename",
            "description",
            "download_url",
            "s3_resource_deleted",
            "created_at",
            "updated_at",
            "sequence_map_for",
            "mta_materials",
            "requests_signed_mta",
            "requests_irb",
            "requests_executed_mta",
            "owned_by_org",
            "owned_by_user",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ShippingRequirementRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRequirement
        fields = (
            "id",
            "created_at",
            "updated_at",
            "needs_shipping_address",
            "needs_payment",
            "accepts_shipping_code",
            "accepts_reimbursement",
            "accepts_other_payment_methods",
            "restrictions",
            "organization",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class MaterialRequestRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequest
        fields = (
            "id",
            "is_active",
            "status",
            "requester_abstract",
            "assigned_to",
            "executed_mta_attachment",
            "irb_attachment",
            "material",
            "requester",
            "requester_signed_mta_attachment",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "assigned_to",
            "requester",
        )


class MaterialShareEventsRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialShareEvent
        fields = (
            "id",
            "created_at",
            "updated_at",
            "material",
            "time",
            "event_type",
            "created_by",
            "assigned_to",
        )


class OrganizationInvitationRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationInvitation
        fields = (
            "id",
            "created_at",
            "updated_at",
            "status",
            "invite_or_request",
            "organization",
            "request_receiver",
            "requester",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "organization",
            "request_receiver",
            "requester",
        )


class AddressRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id",
            "user",
            "saved_for_reuse",
            "name",
            "institution",
            "address_line_1",
            "address_line_2",
            "locality",
            "postal_code",
            "state",
            "country",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class FulfillmentNoteRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FulfillmentNote
        fields = (
            "id",
            "created_by",
            "material_request",
            "text",
        )
        read_only_fields = ("id", "created_at", "updated_at")
