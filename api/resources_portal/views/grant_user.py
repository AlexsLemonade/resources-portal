from rest_framework import viewsets
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Grant, GrantUserAssociation, User
from resources_portal.views.relation_serializers import UserRelationSerializer


class OwnsGrantOrIsAdmin(BasePermission):
    def has_permission(self, request, view):
        grant = Grant.objects.get(pk=view.kwargs["parent_lookup_grants"])

        return (request.user in grant.users.all()) or request.user.is_superuser


class GrantUserViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-created_at")

    permission_classes = [IsAuthenticated, OwnsGrantOrIsAdmin]

    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            raise MethodNotAllowed("GET", detail="Cannot get single User by Grant.")

        return UserRelationSerializer

    def create(self, request, *args, **kwargs):
        user = User.objects.get(pk=request.data["id"])
        grant = Grant.objects.get(pk=kwargs["parent_lookup_grants"])

        GrantUserAssociation.objects.get_or_create(grant=grant, user=user)

        return Response(status=201)

    def destroy(self, request, *args, **kwargs):
        user = User.objects.get(pk=kwargs["pk"])
        grant = Grant.objects.get(pk=kwargs["parent_lookup_grants"])

        if user.grants.count() <= 1:
            return Response(data={"reason": "Delete last grant for user."}, status=400)

        association = GrantUserAssociation.objects.get(grant=grant, user=user)

        association.delete()

        return Response(status=204)
