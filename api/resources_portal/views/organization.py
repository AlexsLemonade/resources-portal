import django.core.exceptions
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission, IsAuthenticated

from resources_portal.models import Organization, User
from resources_portal.views.relation_serializers import (
    AttachmentRelationSerializer,
    MaterialRelationSerializer,
    UserRelationSerializer,
)


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = (
            "id",
            "owner",
            "name",
            "members",
            "materials",
            "attachments",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "members",
            "attachments",
        )


class OrganizationDetailSerializer(OrganizationSerializer):
    owner = UserRelationSerializer()
    members = UserRelationSerializer(many=True, read_only=True)
    materials = MaterialRelationSerializer(many=True, read_only=True)
    attachments = AttachmentRelationSerializer(many=True, read_only=True)

    def create(self, validated_data):
        owner = validated_data.pop("owner")
        validated_data["owner_id"] = owner["id"]

        organization = super(OrganizationSerializer, self).create(validated_data)
        organization.members.set(User.objects.filter(pk=owner["id"]))
        organization.save()

        return organization

    def update(self, instance, validated_data):
        owner = validated_data.pop("owner")
        if owner:
            validated_data["owner_id"] = owner["id"]

        return super(OrganizationSerializer, self).update(instance, validated_data)


class OrganizationListSerializer(OrganizationSerializer):
    owner = serializers.StringRelatedField()
    members = serializers.StringRelatedField(many=True)


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.owner


class IsNewOwnerMember(BasePermission):
    """The new owner must already be a member of the organization."""

    def has_object_permission(self, request, view, obj):
        try:
            request_owner = User.objects.get(pk=request.data["owner"]["id"])
        except django.core.exceptions.Exception:
            # If the new owner does not exist we've got a problem.
            return False

        is_owner_changing = request_owner == obj.owner

        return not is_owner_changing or request_owner in obj.members


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return OrganizationListSerializer

        return OrganizationDetailSerializer

    def get_permissions(self):
        if self.action == "update" or self.action == "delete":
            permission_classes = [IsAuthenticated, IsOwner]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def update(self, request, *args, **kwargs):
        organization = self.get_object()
        serializer = self.get_serializer(organization, data=request.data)
        serializer.is_valid(raise_exception=True)

        new_owner = User.objects.get(pk=serializer.validated_data["owner"]["id"])

        is_owner_changing = organization.owner != new_owner

        if is_owner_changing and new_owner not in organization.members.all():
            raise ValidationError("The new owner must already be a member of the organization.")

        if is_owner_changing:
            organization.remove_owner_perms(organization.owner)
            organization.assign_owner_perms(new_owner)

        return super(OrganizationViewSet, self).update(request, *args, **kwargs)
