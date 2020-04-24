from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from rest_framework import serializers, viewsets

from resources_portal.models import Organization, OrganizationInvitation, User
from resources_portal.views.organization import OrganizationSerializer
from resources_portal.views.user import UserSerializer


class OrganizationInvitationSerializer(serializers.ModelSerializer):
    contact_user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrganizationInvitation
        fields = (
            "id",
            "created_at",
            "updated_at",
            "status",
            "invite_or_request",
            "organization_id",
            "request_reciever_id",
            "requester_id",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class OrganizationInvitationDetailSerializer(OrganizationInvitationSerializer):
    organization_id = OrganizationSerializer()
    request_reciever_id = UserSerializer()
    requester_id = UserSerializer()

    def check_permissions(self, request_reciever_id):
        request_reciever = User.objects.get(pk=request_reciever_id)
        return request_reciever.has_perm("add_members_and_manage_permissions")

    def create(self, validated_data):
        organization_id = validated_data.pop("organization_id")
        request_reciever_id = validated_data.pop("request_reciever_id")
        requester_id = validated_data.pop("requester_id")
        invite_or_request = validated_data.pop("invite_or_request")

        if not self.check_permissions(request_reciever_id):
            return HttpResponseForbidden()

        invitation, created = OrganizationInvitation.objects.get_or_create(
            organization_id=organization_id,
            request_reciever_id=request_reciever_id,
            requester_id=requester_id,
            status="PENDING",
            invite_or_request=invite_or_request,
        )

        return invitation

    def delete(self, validated_data):
        invitation = get_object_or_404(OrganizationInvitation, id=validated_data.pop("id"))
        invitation.delete()

    def update(self, instance, validated_data):
        oldStatus = instance.status
        newStatus = validated_data.pop("status")


class OrganizationInvitationViewSet(viewsets.ModelViewSet):
    queryset = OrganizationInvitation.objects.all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return OrganizationInvitationDetailSerializer

        return OrganizationInvitationSerializer


def organisation_invitation(request, *args, **kwargs):
    organization = Organization.objects.get(pk=kwargs["organization_id"])
    request_reciever_id = User.objects.get(pk=kwargs["request_reciever_id"])
    requester_id = User.objects.get(pk=kwargs["requester_id"])
    invite_or_request = kwargs["invite_or_request"]

    if request.method == "POST":
        OrganizationInvitation.objects.get_or_create(
            organization_id=organization,
            request_reciever_id=request_reciever_id,
            requester_id=requester_id,
            status="PENDING",
            invite_or_request=invite_or_request,
        )
    elif request.method == "DELETE":
        association = GrantMaterialAssociation.objects.get(grant=grant, material=material)
        association.delete()
    else:
        return HttpResponseNotAllowed(["POST", "DELETE"])

    return HttpResponse()
