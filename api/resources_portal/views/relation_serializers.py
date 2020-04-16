"""This file houses serializers which can be used for nested relationships.

These serializers do not use nested relationships themselves, so that
if a grant object links to a user and the user links to the grant, the
JSON won't recur infinitely. For any relationships, these seializers
will use PrimaryKeyRelatedFields.
"""

from rest_framework import serializers

from resources_portal.models import Material, Organization, User


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

    organization = serializers.PrimaryKeyRelatedField(read_only=True)
    contact_user = serializers.PrimaryKeyRelatedField(read_only=True)
