from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path, reverse_lazy
from django.views.generic.base import RedirectView
from rest_framework.authtoken import views
from rest_framework.routers import DefaultRouter

from rest_framework_extensions.routers import ExtendedSimpleRouter

from resources_portal.views import (
    GrantMaterialViewSet,
    GrantViewSet,
    MaterialDocumentView,
    MaterialViewSet,
    OrganizationDocumentView,
    OrganizationGrantViewSet,
    OrganizationInvitationViewSet,
    OrganizationMemberViewSet,
    OrganizationViewSet,
    UserDocumentView,
    UserViewSet,
)

router = ExtendedSimpleRouter(trailing_slash=False)
router.register(r"users", UserViewSet, basename="user")
router.register(r"materials", MaterialViewSet, basename="material")
router.register(r"organizations", OrganizationViewSet, basename="organization").register(
    r"members",
    OrganizationMemberViewSet,
    basename="organizations-members",
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

search_router = DefaultRouter(trailing_slash=False)
search_router.register(r"materials", MaterialDocumentView, basename="search-materials")
search_router.register(r"organizations", OrganizationDocumentView, basename="search-organizations")
search_router.register(r"users", UserDocumentView, basename="search-users")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("v1/", include(router.urls)),
    path("api-token-auth/", views.obtain_auth_token),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    # the 'api-root' from django rest-frameworks default router
    # http://www.django-rest-framework.org/api-guide/routers/#defaultrouter
    re_path(r"^$", RedirectView.as_view(url=reverse_lazy("api-root"), permanent=False)),
    path("v1/search/", include(search_router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
