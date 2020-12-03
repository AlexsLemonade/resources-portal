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
    MaterialRequestIssue,
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
            "description",
            "is_personal_organization",
            "owner",
            "members",
            "materials",
            "grants",
            "created_at",
            "updated_at",
        )

    # Organizations are beefier in relations. Deal with it.
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    members = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    grants = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    materials = serializers.PrimaryKeyRelatedField(many=True, read_only=True)


class MaterialRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = (
            "id",
            "category",
            "title",
            "url",
            "organisms",
            "organization",
            "contact_user",
            "pubmed_id",
            "is_archived",
            "additional_metadata",
            "needs_mta",
            "has_publication",
            "needs_irb",
            "needs_abstract",
            "imported",
            "import_source",
            "publication_title",
            "pre_print_doi",
            "pre_print_title",
            "citation",
            "additional_info",
            "embargo_date",
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
        read_only_fields = ("id", "created_at", "updated_at", "user")


class ShippingRequirementRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRequirement
        fields = (
            "id",
            "created_at",
            "updated_at",
            "needs_shipping_address",
            "sharer_pays_shipping",
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
            "is_active_sharer",
            "is_active_requester",
            "rejection_reason",
            "status",
            "payment_method",
            "payment_method_notes",
            "requester_abstract",
            "assigned_to",
            "has_issues",
            "issues",
            "needs_shipping_info",
            "is_one_month_old",
            "is_missing_requester_documents",
            "requires_action_sharer",
            "requires_action_requester",
            "executed_mta_attachment",
            "irb_attachment",
            "material",
            "requester",
            "requester_signed_mta_attachment",
            "fulfillment_notes",
            "address",
            "human_readable_created_at",
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


class MaterialRequestIssueRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequestIssue
        fields = (
            "id",
            "description",
            "status",
            "material_request",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "material_request",
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


class FulfillmentNoteRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FulfillmentNote
        fields = (
            "id",
            "created_by",
            "material_request",
            "text",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
