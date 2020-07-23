"""This file houses serializers which can be used for nested relationships.

These serializers do not use nested relationships themselves, so that
if a grant object links to a user and the user links to the grant, the
JSON won't recur infinitely. For any relationships, these serializers
will use PrimaryKeyRelatedFields.
"""

from rest_framework import serializers

from resources_portal.models import (
    Attachment,
    Grant,
    Material,
    MaterialRequest,
    Organization,
    OrganizationInvitation,
    ShippingRequirements,
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
            "created_at",
            "updated_at",
        )
        read_only_fields = ("username", "first_name", "last_name", "created_at", "updated_at")
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
            "users",
            "organizations",
            "materials",
            "created_at",
            "updated_at",
        )

    users = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    organizations = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    materials = serializers.PrimaryKeyRelatedField(many=True, read_only=True)


class AttachmentRelationSerializer(serializers.ModelSerializer):
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


class ShippingRequirementsRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRequirements
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
        )
        read_only_fields = ("id", "created_at", "updated_at")


class MaterialRequestRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequest
        fields = (
            "id",
            "is_active",
            "status",
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
        model = ShippingRequirements
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
            "request_reciever",
            "requester",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "organization",
            "request_reciever",
            "requester",
        )
