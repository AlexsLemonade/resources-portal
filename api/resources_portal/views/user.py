from django.db import transaction
from rest_framework import serializers, viewsets
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated

from resources_portal.models import Organization, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("username", "created_at", "updated_at")


class CreateUserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        # call create_user on user object. Without this
        # the password will be stored in plain text.
        user = User.objects.create_user(**validated_data)
        return user

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "auth_token",
        )
        read_only_fields = ("auth_token",)
        extra_kwargs = {"password": {"write_only": True}}


class IsUserOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj or request.user.is_superuser


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        response = super(UserViewSet, self).create(request, args, kwargs)

        # Every user should have their own organization.
        user = User.objects.get(id=response.data["id"])
        Organization.objects.create(owner=user)

        return response

    def destroy(self, request, *args, **kwargs):
        user = User.objects.get(pk=kwargs["pk"])
        self.check_object_permissions(request, user)
        user.deleted = True
        user.save()

        return Response(status=204)

    def get_serializer_class(self):
        if self.action == "create":
            return CreateUserSerializer

        return UserSerializer

    def get_permissions(self):
        if self.action == "update" or self.action == "partial_update" or self.action == "destroy":
            permission_classes = [IsAuthenticated, IsUserOrAdmin]
        elif self.action == "create":
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]
