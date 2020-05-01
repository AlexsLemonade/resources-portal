from django.core.exceptions import PermissionDenied
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from resources_portal.models import Organization, OrganizationInvitation, User
from resources_portal.views.organization import OrganizationSerializer
from resources_portal.views.user import UserSerializer


class OrganizationInvitationSerializer(serializers.ModelSerializer):
    requester = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    request_reciever = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

    def validate(self, data):
        if not data["request_reciever"].has_perm(
            "add_members_and_manage_permissions", data["organization"]
        ):
            raise PermissionDenied
        else:
            return data

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

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super(OrganizationInvitationViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super(OrganizationInvitationViewSet, self).update(request, *args, **kwargs)

    def delete(self, request, instance):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super(OrganizationInvitationViewSet, self).delete(request, instance)
