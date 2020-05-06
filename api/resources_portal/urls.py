from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path, reverse_lazy
from django.views.generic.base import RedirectView
from rest_framework.authtoken import views
from rest_framework.routers import DefaultRouter

from resources_portal.views import (
    GrantViewSet,
    MaterialDocumentView,
    MaterialViewSet,
    OrganizationDocumentView,
    OrganizationViewSet,
    UserCreateViewSet,
    UserDocumentView,
    UserViewSet,
    grant_material_relationship,
    list_grant_material_relationships,
)

router = DefaultRouter(trailing_slash=False)
router.register(r"users", UserViewSet)
router.register(r"users", UserCreateViewSet)
router.register(r"materials", MaterialViewSet)
router.register(r"organizations", OrganizationViewSet)
router.register(r"grants", GrantViewSet)


search_router = DefaultRouter(trailing_slash=False)
search_router.register(r"materials", MaterialDocumentView, basename="search-materials")
search_router.register(r"organizations", OrganizationDocumentView, basename="search-organizations")
search_router.register(r"users", UserDocumentView, basename="search-users")

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "v1/grants/<int:pk>/materials/<int:material_id>/",
        grant_material_relationship,
        name="grant-associate-material",
    ),
    path(
        "v1/grants/<int:pk>/materials/",
        list_grant_material_relationships,
        name="grant-list-materials",
    ),
    path("v1/", include(router.urls)),
    path("api-token-auth/", views.obtain_auth_token),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    # the 'api-root' from django rest-frameworks default router
    # http://www.django-rest-framework.org/api-guide/routers/#defaultrouter
    re_path(r"^$", RedirectView.as_view(url=reverse_lazy("api-root"), permanent=False)),
    path("search/", include(search_router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
