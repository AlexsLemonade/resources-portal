from django.http import HttpResponse, HttpResponseForbidden, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from resources_portal.models import Organization, OrganizationInvitation, User
from resources_portal.views.organization import OrganizationSerializer
from resources_portal.views.user import UserSerializer


class OrganizationInvitationSerializer(serializers.ModelSerializer):
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
    request_reciever_id = UserSerializer()
    requester_id = UserSerializer()


def check_permissions(request_reciever_id):
    request_reciever = User.objects.get(pk=request_reciever_id)
    return request_reciever.has_perm("add_members_and_manage_permissions")


@api_view(["GET", "POST"])
def invitation_list(request):
    if request.method == "POST":
        serializer = OrganizationInvitationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    elif request.method == "GET":
        invitations = OrganizationInvitation.objects.all()
        serializer = OrganizationInvitationSerializer(invitations, many=True)
        return Response(serializer.data)


@api_view(["GET", "PUT", "DELETE"])
def invitation_detail(request, pk):
    try:
        invitation = OrganizationInvitation.objects.get(pk=pk)
    except OrganizationInvitation.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = OrganizationInvitationSerializer(invitation)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = OrganizationInvitationSerializer(invitation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        invitation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrganizationInvitationViewSet(viewsets.ModelViewSet):
    queryset = OrganizationInvitation.objects.all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return OrganizationInvitationDetailSerializer

        return OrganizationInvitationSerializer
