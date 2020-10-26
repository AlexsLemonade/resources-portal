from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path, reverse_lazy
from django.views.generic.base import RedirectView
from rest_framework.authtoken import views
from rest_framework.routers import DefaultRouter

from rest_framework_extensions.routers import ExtendedSimpleRouter

from resources_portal.views import (
    AddressViewSet,
    AttachmentViewSet,
    FulfillmentNoteViewSet,
    GrantMaterialViewSet,
    GrantViewSet,
    ImportViewSet,
    LoginViewSet,
    MaterialDocumentView,
    MaterialRequestIssueViewSet,
    MaterialRequestViewSet,
    MaterialViewSet,
    NotificationViewSet,
    ORCIDCredentialsViewSet,
    OrganizationDocumentView,
    OrganizationGrantViewSet,
    OrganizationInvitationViewSet,
    OrganizationMaterialViewSet,
    OrganizationMemberViewSet,
    OrganizationUserSettingViewSet,
    OrganizationViewSet,
    ShippingRequirementViewSet,
    UserDocumentView,
    UserOrganizationViewSet,
    UserViewSet,
    attachment_copy_view,
    email_invitation_view,
    local_file_view,
    report_issue_view,
)

router = ExtendedSimpleRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"users", UserViewSet, basename="user").register(
    r"organizations",
    UserOrganizationViewSet,
    basename="users-organizations",
    parents_query_lookups=["user"],
)
router.register(r"users", UserViewSet, basename="user").register(
    r"notifications", NotificationViewSet, basename="notifications", parents_query_lookups=["user"],
)
router.register(r"users", UserViewSet, basename="user").register(
    r"addresses", AddressViewSet, basename="users-addresses", parents_query_lookups=["user"],
)

router.register(r"organizations", OrganizationViewSet, basename="organization").register(
    r"members",
    OrganizationMemberViewSet,
    basename="organizations-members",
    parents_query_lookups=["organization"],
)
router.register(r"organizations", OrganizationViewSet, basename="organization").register(
    r"materials",
    OrganizationMaterialViewSet,
    basename="organizations-materials",
    parents_query_lookups=["organization"],
)
router.register(r"organizations", OrganizationViewSet, basename="organization").register(
    r"grants",
    OrganizationGrantViewSet,
    basename="organizations-grants",
    parents_query_lookups=["organizations"],
)

router.register(r"invitations", OrganizationInvitationViewSet, basename="invitation")

router.register(r"grants", GrantViewSet, basename="grant").register(
    r"materials",
    GrantMaterialViewSet,
    basename="grants-material",
    parents_query_lookups=["grants"],
)

router.register(r"attachments", AttachmentViewSet, basename="attachment")

router.register(
    r"organization-user-settings",
    OrganizationUserSettingViewSet,
    basename="organization-user-setting",
)

router.register(
    r"shipping-requirements", ShippingRequirementViewSet, basename="shipping-requirement"
)

router.register(r"materials", MaterialViewSet, basename="material")
router.register(r"material-requests", MaterialRequestViewSet, basename="material-request").register(
    r"issues",
    MaterialRequestIssueViewSet,
    basename="material-requests-issues",
    parents_query_lookups=["material_request"],
)
router.register(r"material-requests", MaterialRequestViewSet, basename="material-request").register(
    r"fulfillment-notes",
    FulfillmentNoteViewSet,
    basename="material-requests-notes",
    parents_query_lookups=["material_request"],
)

search_router = DefaultRouter()
search_router.register(r"materials", MaterialDocumentView, basename="search-materials")
search_router.register(r"organizations", OrganizationDocumentView, basename="search-organizations")
search_router.register(r"users", UserDocumentView, basename="search-users")

urlpatterns = [
    path("admin/", admin.site.urls),
    # Must go before /materials/ so it doesn't think "import" is an id.
    path(
        "v1/materials/import/", ImportViewSet.as_view({"post": "create"}), name="materials-import"
    ),
    path("v1/", include(router.urls)),
    path("api-token-auth/", views.obtain_auth_token),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    # the 'api-root' from django rest-frameworks default router
    # http://www.django-rest-framework.org/api-guide/routers/#defaultrouter
    re_path(r"^$", RedirectView.as_view(url=reverse_lazy("api-root"), permanent=False)),
    path("v1/search/", include(search_router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.append(
    path(
        "v1/materials/<int:material_id>/requests",
        MaterialRequestViewSet.as_view({"get": "list"}),
        name="material-material-requests-list",
    )
)
urlpatterns.append(
    path("v1/attachments/<int:attachment_id>/copy", attachment_copy_view, name="attachment-copy",)
)


urlpatterns.append(
    path(
        "v1/orcid-credentials/",
        ORCIDCredentialsViewSet.as_view({"post": "create"}),
        name="orcid-credentials",
    )
)
urlpatterns.append(path("v1/login/", LoginViewSet.as_view({"post": "create"}), name="login"))
urlpatterns.append(path("v1/email-invitation/", email_invitation_view, name="email-invitation"))
urlpatterns.append(path("v1/report-issue/", report_issue_view, name="report-issue"))

if settings.LOCAL_FILE_DIRECTORY:
    urlpatterns.append(
        path("v1/uploaded-file/<path:file_path>", local_file_view, name="uploaded-file")
    )
