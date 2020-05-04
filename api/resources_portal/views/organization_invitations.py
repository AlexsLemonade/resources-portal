from django.core.exceptions import PermissionDenied
from rest_framework import serializers, status, viewsets
from rest_framework.response import Response

from resources_portal.models import Organization, OrganizationInvitation, User


class OrganizationInvitationSerializer(serializers.ModelSerializer):
    requester = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    request_reciever = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

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


class OrganizationInvitationViewSet(viewsets.ModelViewSet):
    queryset = OrganizationInvitation.objects.all()
    serializer_class = OrganizationInvitationSerializer

    def update_organizations(self, new_status, invitation):
        old_status = invitation.status
        if old_status == "PENDING" and new_status == "ACCEPTED":
            invitation.organization.members.add(invitation.requester)
            # TODO: Add notification of acceptance
        elif old_status == "PENDING" and new_status == "REJECTED":
            pass
            # TODO: Add notification of rejection
        elif old_status == "PENDING" and new_status == "INVALID":
            pass
            # TODO: Add notification of invalid request reciever

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)

        if not OrganizationInvitationSerializer(data=request.data).is_valid():
            return Response(status=status.HTTP_400_BAD_REQUEST)

        request_reciever = User.objects.get(pk=request.data["request_reciever"])
        organization = Organization.objects.get(pk=request.data["organization"])

        if request.data["invite_or_request"] == "INVITE" and not request_reciever.has_perm(
            "add_members_and_manage_permissions", organization
        ):
            return Response(
                f"{request_reciever} does not have permission to add members",
                status=status.HTTP_403_FORBIDDEN,
            )

        return super(OrganizationInvitationViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)
        invitation = OrganizationInvitation.objects.get(pk=kwargs["pk"])

        requester_accepting = (
            request.user == invitation.requester and invitation.invite_or_request == "INVITE"
        )
        request_reciever_approving = (
            request.user == invitation.request_reciever
            and invitation.invite_or_request == "REQUEST"
        )

        # Xor operator
        if not requester_accepting ^ request_reciever_approving:
            return Response(
                f"The current user, {request.user}, is not the correct user to handle invitation id {invitation.id}",
                status=status.HTTP_403_FORBIDDEN,
            )

        if not invitation.status == "PENDING":
            return Response(
                f"Invitation id {invitation.id} has already been resolved with a status of {invitation.status}",
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_status = request.data["status"]
        self.update_organizations(new_status, invitation)
        return super(OrganizationInvitationViewSet, self).update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)

        invitation = OrganizationInvitation.objects.get(pk=kwargs["pk"])
        if not request.user == invitation.requester:
            return Response(
                f"The current user, {request.user}, is not the requester of invitation id {invitation.id}",
                status=status.HTTP_403_FORBIDDEN,
            )

        return super(OrganizationInvitationViewSet, self).delete(request, *args, **kwargs)
