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
    # owner_id = serializers.PrimaryKeyRelatedField(
    #     source="owner", queryset=User.objects.all(), write_only=True
    # )
    members = UserRelationSerializer(many=True)
    # members = serializers.PrimaryKeyRelatedField(
    #     # Why is this owner? I think maybe it should be members.
    #     many=True, queryset=User.objects.all(), write_only=True
    # )

    def update_users(self, organization, owner, members):
        if not owner or members:
            # Nothing to do.
            return organization

        if owner:
            organization.owner = User.objects.get(id=owner["id"])

        if members:
            member_ids = [member["id"] for member in members]
            organization.members.set(User.objects.filter(id__in=member_ids))

        organization.save()

    def create(self, validated_data):
        owner = validated_data.pop("owner")
        members = validated_data.pop("members")

        organization = super(OrganizationSerializer, self).create(validated_data)

        self.update_users(organization, owner, members)

        return organization

    def update(self, instance, validated_data):
        owner = validated_data.pop("owner")
        members = validated_data.pop("members")

        organization = super(OrganizationSerializer, self).update(instance, validated_data)

        self.update_users(organization, owner, members)

        return organization


class OrganizationListSerializer(OrganizationSerializer):
    owner = serializers.StringRelatedField()
    members = serializers.StringRelatedField(many=True)


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return OrganizationListSerializer

        return OrganizationDetailSerializer
