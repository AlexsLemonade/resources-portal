from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import Organization, ShippingRequirement

# from resources_portal.views.relation_serializers import OrganizationRelationSerializer


class ShippingRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRequirement
        fields = (
            "id",
            "needs_shipping_address",
            "needs_payment",
            "sharer_pays_shipping",
            "accepts_shipping_code",
            "accepts_reimbursement",
            "accepts_other_payment_methods",
            "restrictions",
            "organization",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "created_at", "updated_at")


class ShippingRequirementDetailSerializer(ShippingRequirementSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        allow_null=True, queryset=Organization.objects.all()
    )


class IsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser


class IsInOrganizationCreate(BasePermission):
    def has_permission(self, request, view):
        if "organization" not in request.data:
            return False

        organization = Organization.objects.get(pk=request.data["organization"])

        if not organization:
            return False

        return request.user in organization.members.all()


class IsInOrganization(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not obj.organization:
            return False

        return request.user in obj.organization.members.all()


class ShippingRequirementViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = ShippingRequirement.objects.all().order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "list":
            return ShippingRequirementSerializer

        return ShippingRequirementDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAdminUser]
        elif self.action == "create":
            permission_classes = [IsInOrganizationCreate]
        else:
            permission_classes = [IsAuthenticated, IsInOrganization]

        return [permission() for permission in permission_classes]
