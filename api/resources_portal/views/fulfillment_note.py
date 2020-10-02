from django.forms.models import model_to_dict
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from rest_framework_extensions.mixins import NestedViewSetMixin

from resources_portal.models import FulfillmentNote, MaterialRequest, MaterialShareEvent
from resources_portal.serializers import UserRelationSerializer


class FulfillmentNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FulfillmentNote
        fields = (
            "id",
            "created_by",
            "material_request",
            "text",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "created_at", "updated_at")


class FulfillmentNoteDetailSerializer(FulfillmentNoteSerializer):
    created_by = UserRelationSerializer(read_only=True)


class IsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser


class IsSharer(BasePermission):
    def has_object_permission(self, request, view, obj):
        organization = MaterialRequest.objects.get(
            pk=view.kwargs["parent_lookup_material_request"]
        ).material.organization
        return request.user in organization.members.all()


class IsRequesterOrSharer(BasePermission):
    def has_object_permission(self, request, view, obj):
        material_request = MaterialRequest.objects.get(
            pk=view.kwargs["parent_lookup_material_request"]
        )
        return (
            request.user == material_request.requester
            or request.user in material_request.material.organization.members.all()
        )


class FulfillmentNoteViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    queryset = FulfillmentNote.objects.all().order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "list":
            return FulfillmentNoteSerializer

        return FulfillmentNoteDetailSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAdminUser]
        elif self.action == "retrieve":
            permission_classes = [IsAuthenticated, IsRequesterOrSharer]
        else:
            permission_classes = [IsAuthenticated, IsSharer]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if "created_by" in request.data:
            raise ValidationError(
                (
                    "You may not specify the created_by field while creating fulfillment notes. "
                    "The fulfillment note will automatically be designated as created_by "
                    "the request's User."
                )
            )

        serializer = FulfillmentNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.validated_data["created_by"] = request.user

        fulfillment_note = FulfillmentNote(**serializer.validated_data)
        fulfillment_note.save()

        MaterialShareEvent(
            event_type="REQUEST_FULFILLMENT_NOTE_ADDED",
            material=fulfillment_note.material_request.material,
            material_request=fulfillment_note.material_request,
            created_by=fulfillment_note.created_by,
            assigned_to=fulfillment_note.material_request.assigned_to,
        ).save()

        return Response(data=model_to_dict(fulfillment_note), status=201)
