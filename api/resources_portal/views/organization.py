from rest_framework import serializers, viewsets

from resources_portal.models import Organization, User
from resources_portal.views.relation_serializers import UserRelationSerializer


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

    def update_members(self, organization, owner_id, members):
        """If owner_id is not in members, it will be added."""
        member_ids = [member["id"] for member in members]

        if owner_id not in member_ids:
            member_ids.append(owner_id)

        organization.members.set(User.objects.filter(id__in=member_ids))
        organization.save()

        return organization

    def create(self, validated_data):
        owner = validated_data.pop("owner")
        members = validated_data.pop("members")
        validated_data["owner_id"] = owner["id"]

        organization = super(OrganizationSerializer, self).create(validated_data)

        return self.update_members(organization, owner["id"], members)

    def update(self, instance, validated_data):
        owner = validated_data.pop("owner")
        members = validated_data.pop("members")
        if owner:
            validated_data["owner_id"] = owner["id"]

        organization = super(OrganizationSerializer, self).update(instance, validated_data)

        return self.update_members(organization, owner["id"], members)


class OrganizationListSerializer(OrganizationSerializer):
    owner = serializers.StringRelatedField()
    members = serializers.StringRelatedField(many=True)


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return OrganizationListSerializer

        return OrganizationDetailSerializer
