from rest_framework import serializers, viewsets

from resources_portal.models import Organization, User
from resources_portal.views.user import UserRelationSerializer


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = (
            "id",
            "owner",
            "members",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class OrganizationDetailSerializer(OrganizationSerializer):
    owner = UserRelationSerializer()
    members = UserRelationSerializer(many=True)

    def update_members(self, organization, members):
        if not members:
            # Nothing to do.
            return organization

        member_ids = [member["id"] for member in members]

        organization.members.set(User.objects.filter(id__in=member_ids))
        organization.save()

        return organization

    def create(self, validated_data):
        owner = validated_data.pop("owner")
        members = validated_data.pop("members")
        validated_data["owner_id"] = owner["id"]

        organization = super(OrganizationSerializer, self).create(validated_data)

        return self.update_members(organization, members)

    def update(self, instance, validated_data):
        owner = validated_data.pop("owner")
        members = validated_data.pop("members")
        if owner:
            validated_data["owner_id"] = owner["id"]

        organization = super(OrganizationSerializer, self).update(instance, validated_data)

        return self.update_members(organization, members)


class OrganizationListSerializer(OrganizationSerializer):
    owner = serializers.StringRelatedField()
    members = serializers.StringRelatedField(many=True)


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return OrganizationListSerializer

        return OrganizationDetailSerializer
