from rest_framework import serializers, status, viewsets
from rest_framework.response import Response

from resources_portal.models import (
    Notification,
    Organization,
    OrganizationInvitation,
    OrganizationUserSetting,
    User,
)


class OrganizationInvitationSerializer(serializers.ModelSerializer):
    requester = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    request_receiver = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    invite_or_request = serializers.CharField()

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


class OrganizationInvitationViewSet(viewsets.ModelViewSet):
    queryset = OrganizationInvitation.objects.all()
    serializer_class = OrganizationInvitationSerializer

    http_method_names = ["post", "options"]

    def update_organizations(self, new_status, invitation):
        if new_status == "ACCEPTED":
            invitation.organization.members.add(invitation.requester)
            invitation.organization.assign_member_perms(invitation.requester)
            OrganizationUserSetting.objects.get_or_create(
                user=invitation.requester, organization=invitation.organization
            )

        # This is the logic we'll want for the invitation flow, but
        # for now just notify the invitation receiver.
        # notification_type = f"ORG_{invitation.invite_or_request}_{new_status}"
        # if invitation.invite_or_request == "INVITE":
        #     notified_user = invitation.request_receiver
        #     associated_user = invitation.requester
        # else:
        #     notified_user = invitation.requester
        #     associated_user = invitation.request_receiver

        notification_type = "ADDED_TO_ORG"
        notified_user = invitation.request_receiver
        associated_user = invitation.requester

        notification = Notification(
            notification_type=notification_type,
            notified_user=notified_user,
            associated_user=associated_user,
            associated_organization=invitation.organization,
        )
        notification.save()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        serializer = OrganizationInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_receiver = serializer.validated_data["request_receiver"]
        organization = serializer.validated_data["organization"]
        invite_or_request = serializer.validated_data["invite_or_request"]

        if invite_or_request == "INVITE" and not request_receiver.has_perm(
            "add_members", organization
        ):
            return Response(
                data={"detail": f"{request_receiver} does not have permission to add members"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.data["invite_or_request"] == "INVITE":
            notification = Notification(
                notification_type="ORG_INVITE_CREATED",
                notified_user=request.user,
                associated_user=request_receiver,
                associated_organization=organization,
            )
            notification.save()
        else:
            notification = Notification(
                notification_type="ORG_REQUEST_CREATED",
                notified_user=request_receiver,
                associated_user=request.user,
                associated_organization=organization,
            )
            notification.save()

        # Facilitate adding without confirmation by making the
        # invitation accepted automatically.
        request.data["status"] = "ACCEPTED"

        response = super(OrganizationInvitationViewSet, self).create(request, *args, **kwargs)

        # questionable
        invitation = OrganizationInvitation.objects.get(id=response.data["id"])

        self.update_organizations(request.data["status"], invitation)

        return response

    # For now, we don't need to update or destroy because we allow users to
    # be added to organizatons without confirmation.

    # def update(self, request, *args, **kwargs):
    #     if not request.user.is_authenticated:
    #         return Response(status=status.HTTP_401_UNAUTHORIZED)
    #     invitation = OrganizationInvitation.objects.get(pk=kwargs["pk"])

    #     requester_accepting = (
    #         request.user == invitation.requester and invitation.invite_or_request == "INVITE"
    #     )
    #     request_receiver_approving = (
    #         request.user == invitation.request_receiver
    #         and invitation.invite_or_request == "REQUEST"
    #     )

    #     if not (requester_accepting or request_receiver_approving):
    #         return Response(
    #             data={
    #                 "detail": f"The current user, {request.user}, is not the correct user to handle invitation id {invitation.id}"
    #             },
    #             status=status.HTTP_403_FORBIDDEN,
    #         )

    #     if not invitation.status == "PENDING":
    #         return Response(
    #             data={
    #                 "detail": f"Invitation id {invitation.id} has already been resolved with a status of {invitation.status}"
    #             },
    #             status=status.HTTP_400_BAD_REQUEST,
    #         )

    #     new_status = request.data["status"]
    #     response_status = super(OrganizationInvitationViewSet, self).update(
    #         request, *args, **kwargs
    #     )
    #     self.update_organizations(new_status, invitation)
    #     return response_status

    # def destroy(self, request, *args, **kwargs):
    #     if not request.user.is_authenticated:
    #         return Response(status=status.HTTP_401_UNAUTHORIZED)

    #     invitation = OrganizationInvitation.objects.get(pk=kwargs["pk"])
    #     if not request.user == invitation.requester:
    #         return Response(
    #             data={
    #                 "detail": f"The current user, {request.user}, is not the requester of invitation id {invitation.id}"
    #             },
    #             status=status.HTTP_403_FORBIDDEN,
    #         )

    #     return super(OrganizationInvitationViewSet, self).destroy(request, *args, **kwargs)
