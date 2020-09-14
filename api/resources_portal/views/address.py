from django.forms.models import model_to_dict
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Address, User
from resources_portal.views.relation_serializers import UserRelationSerializer


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id",
            "user",
            "saved_for_reuse",
            "name",
            "institution",
            "address_line_1",
            "address_line_2",
            "locality",
            "postal_code",
            "state",
            "country",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "user")


class SavedAddressSerializer(AddressSerializer):
    def to_representation(self, data):
        if data.saved_for_reuse:
            return super(AddressSerializer, self).to_representation(data)
        else:
            return None


class AddressDetailSerializer(AddressSerializer):
    user = UserRelationSerializer(read_only=True)


class IsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = User.objects.get(pk=view.kwargs["parent_lookup_user"])
        return request.user == user


class AddressViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = Address.objects.all().order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "list":
            return AddressSerializer

        return AddressDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated, IsOwner]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if "user" in request.data:
            raise ValidationError(
                (
                    "You may not specify the user field while creating addresses. "
                    "The address will automatically be assigned to the request's User."
                )
            )

        serializer = AddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.validated_data["user"] = request.user

        address = Address(**serializer.validated_data)
        address.save()

        return Response(data=model_to_dict(address), status=201)
