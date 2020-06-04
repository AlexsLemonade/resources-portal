from django.forms.models import model_to_dict
from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from resources_portal.models import MaterialRequest, Notification
from resources_portal.views.relation_serializers import (
    AttachmentRelationSerializer,
    MaterialRelationSerializer,
    UserRelationSerializer,
)

SHARER_MODIFIABLE_FIELDS = {"status", "executed_mta_attachment"}

REQUESTER_MODIFIABLE_FIELDS = {"irb_attachment", "requester_signed_mta_attachment", "status"}


class MaterialRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequest
        fields = (
            "id",
            "is_active",
            "status",
            "assigned_to",
            "executed_mta_attachment",
            "irb_attachment",
            "material",
            "requester",
            "requester_signed_mta_attachment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class MaterialRequestDetailSerializer(MaterialRequestSerializer):
    assigned_to = UserRelationSerializer()
    requester = UserRelationSerializer()
    material = MaterialRelationSerializer()
    executed_mta_attachment = AttachmentRelationSerializer()
    irb_attachment = AttachmentRelationSerializer()
    requester_signed_mta_attachment = AttachmentRelationSerializer()


class CanViewRequests(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("view_requests", obj.material.organization)


class CanViewRequestsOrIsRequester(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user.has_perm("view_requests", obj.material.organization)
            or request.user == obj.requester
        )


class CanApproveRequests(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.has_perm("approve_requests", obj.material.organization)


class CanApproveRequestsOrIsRequester(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user.has_perm("approve_requests", obj.material.organization)
            or request.user == obj.requester
        )


class MaterialRequestViewSet(viewsets.ModelViewSet):
    queryset = MaterialRequest.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return MaterialRequestSerializer

        return MaterialRequestDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [
                IsAuthenticated,
                CanViewRequests,
            ]
        elif self.action == "retrieve":
            permission_classes = [IsAuthenticated, CanViewRequestsOrIsRequester]
        elif self.action == "update" or self.action == "partial-update":
            permission_classes = [IsAuthenticated, CanApproveRequestsOrIsRequester]
        elif self.action == "destroy":
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [
                IsAuthenticated,
            ]

        return [permission() for permission in permission_classes]

    # Determines what the next requirement(s) are for the material request.
    # Returns a list of the next requirements, which is null if there are none left
    def get_material_requirements(self):
        request = self.get_object()
        material = request.material

        requirements_list = []

        if request.status == "PENDING":
            requirements_list.append("NEEDS_TO_BE_APPROVED")

        if material.needs_mta and not request.requester_signed_mta_attachment:
            requirements_list.append("NEEDS_MTA_TO_BE_SIGNED")

        if material.needs_mta and not request.executed_mta_attachment:
            requirements_list.append("NEEDS_MTA_TO_BE_SIGNED")

        if material.needs_irb and not request.irb_attachment:
            requirements_list.append("NEEDS_IRB")

        return requirements_list

    def create(self, request, *args, **kwargs):
        serializer = MaterialRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        material = serializer.validated_data["material"]
        serializer.validated_data["assigned_to"] = material.contact_user

        material_request = MaterialRequest(**serializer.validated_data)
        material_request.save()

        notification = Notification(
            notification_type="TRANSFER_REQUESTED",
            notified_user=material_request.assigned_to,
            associated_user=request.user,
            associated_material=material,
        )
        notification.save()

        return Response(data=model_to_dict(material_request), status=201)

    def update(self, request, *args, **kwargs):
        material_request = self.get_object()

        if material_request.status == "CANCELLED" or material_request.status == "REJECTED":
            return Response(status=403)

        serializer = MaterialRequestSerializer(material_request, data=request.data)
        serializer.is_valid(raise_exception=True)

        if request.user == material_request.requester:
            if "irb_attachment" in request.data:
                material_request.irb_attachment = serializer.validated_data["irb_attachment"]

            if "requester_signed_mta_attachment" in request.data:
                material_request.requester_signed_mta_attachment = serializer.validated_data[
                    "requester_signed_mta_attachment"
                ]

            if "status" in request.data and request.data["status"] != material_request.status:
                if serializer.validated_data["status"] != "CANCELLED":
                    return Response(status=403)
                else:
                    material_request.status = serializer.validated_data["status"]

        else:
            if "status" in request.data:
                if serializer.validated_data["status"] == "CANCELLED":
                    return Response(status=403)
                material_request.status = serializer.validated_data["status"]

            if "executed_mta_attachment" in request.data:
                material_request.executed_mta_attachment = serializer.validated_data[
                    "executed_mta_attachment"
                ]

        material_request.save()

        response_data = model_to_dict(material_request)
        response_data["requirements"] = self.get_material_requirements()

        return Response(data=response_data, status=200)
