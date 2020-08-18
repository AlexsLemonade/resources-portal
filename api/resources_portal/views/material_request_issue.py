from django.forms.models import model_to_dict
from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from guardian.shortcuts import get_objects_for_user

from resources_portal.models import (
    MaterialRequest,
    MaterialRequestIssue,
    Notification,
    Organization,
)
from resources_portal.views.relation_serializers import MaterialRequestRelationSerializer

MATERIAL_ARCHIVED_ERROR = "Cannot open issues for requests whose materials have been archived."
REQUEST_UNFULFILLED_ERROR = "Cannot open issues for requests which haven't been fulfilled."


class MaterialRequestIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequestIssue
        fields = (
            "id",
            "description",
            "status",
            "material_request",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "material_request",
        )


class MaterialRequestIssueDetailSerializer(MaterialRequestIssueSerializer):
    material_request = MaterialRequestRelationSerializer()


class IsRequester(BasePermission):
    def has_permission(self, request, view):
        material_request = MaterialRequest.objects.get(
            pk=view.kwargs["parent_lookup_material_request"]
        )

        return request.user == material_request.requester


class IsAdminUser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser


class IsRequesterOrIsInOrg(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user == obj.material_request.requester
            or request.user in obj.material_request.material.organization.members.all()
        )


# def send_material_request_issue_notif(notif_type, issue, notified_user):
#     notification = Notification(
#         notification_type=notif_type,
#         notified_user=notified_user,
#         associated_user=issue.assigned_to,
#         associated_material=issue.request.material,
#         associated_organization=issue.request.material.organization,
#     )
#     notification.save()


# def send_transfer_update_notif(status, request):
#     if status == "OPENED":
#         send_material_request_issue_notif("REQUEST_ISSUE_OPENED", request, request.requester)
#     elif status == "CLOSED":
#         send_material_request_issue_notif("REQUEST_ISSUE_CLOSED", request, request.requester)
#     else:
#         return


class MaterialRequestIssueViewSet(viewsets.ModelViewSet):
    # No delete, these just get closed.
    http_method_names = ["get", "list", "post", "put", "patch", "head", "options"]

    def get_queryset(self):
        if self.action == "list":
            requests_made_by_user = MaterialRequest.objects.filter(requester=self.request.user)
            organizations = get_objects_for_user(
                self.request.user, "view_requests", klass=Organization.objects
            )
            requests_viewable_by_user = MaterialRequest.objects.filter(
                material__organization__in=organizations
            )

            viewable_requests = requests_made_by_user.union(requests_viewable_by_user)
            return MaterialRequestIssue.objects.filter(
                material_request_id__in=viewable_requests.values("id")
            )
            # viewable_requests = requests_made_by_user.union(requests_viewable_by_user)
            # return MaterialRequestIssue.objects.filter(material_request__in=viewable_requests)
        else:
            return MaterialRequestIssue.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return MaterialRequestIssueSerializer

        return MaterialRequestIssueDetailSerializer

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [IsAuthenticated, IsRequester]
        if (
            self.action == "list"
            or self.action == "retrieve"
            or self.action == "update"
            or self.action == "partial-update"
        ):
            permission_classes = [IsAuthenticated, IsRequesterOrIsInOrg]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        # TODO: Generate a notification

        serializer = MaterialRequestIssueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        material_request = MaterialRequest.objects.get(pk=kwargs["parent_lookup_material_request"])
        material = material_request.material

        if material.is_archived:
            return Response(data={"reason": MATERIAL_ARCHIVED_ERROR}, status=400,)

        if material_request.status not in ["FULFILLED", "VERIFIED_FULFILLED"]:
            return Response(data={"reason": REQUEST_UNFULFILLED_ERROR}, status=400,)

        serializer.validated_data["material_request_id"] = material_request.id
        material_request_issue = MaterialRequestIssue(**serializer.validated_data)
        material_request_issue.save()

        # Once a issue is created, the request should no longer be fulfilled.
        material_request.status = "IN_FULFILLMENT"
        material_request.save()

        notification = Notification(
            notification_type="REQUEST_ISSUE_OPENED",
            notified_user=material_request.assigned_to,
            associated_user=request.user,
            associated_material=material,
            associated_organization=material.organization,
        )
        notification.save()

        return Response(data=model_to_dict(material_request_issue), status=201)

    def update(self, request, *args, **kwargs):
        material_request_issue = self.get_object()

        if material_request_issue.status == "CLOSED":
            return Response(data={"reason": "Cannot update closed issues."}, status=400,)

        material_request = material_request_issue.material_request

        serializer = MaterialRequestIssueSerializer(
            material_request_issue, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if request.data["status"] == "CLOSED":
            material_request.refresh_from_db()

            notification = Notification(
                notification_type="REQUEST_ISSUE_CLOSED",
                notified_user=material_request.assigned_to,
                associated_user=material_request.requester,
                associated_material=material_request.material,
                associated_organization=material_request.material.organization,
            )
            notification.save()

            if not material_request.has_issues:
                material_request.status = "FULFILLED"
                material_request.save()

                # Don't notify the requester that they closed their own issue.
                if request.user != material_request.requester:
                    notification = Notification(
                        notification_type="TRANSFER_FULFILLED",
                        notified_user=material_request.requester,
                        associated_user=request.user,
                        associated_material=material_request.material,
                        associated_organization=material_request.material.organization,
                    )
                    notification.save()

        material_request_issue.refresh_from_db()

        response_data = model_to_dict(material_request_issue)
        response_data["material_request"] = model_to_dict(material_request)

        return Response(data=response_data, status=200)
