from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path, reverse_lazy
from django.views.generic.base import RedirectView
from rest_framework.authtoken import views
from rest_framework.routers import DefaultRouter

from resources_portal.views import (
    MaterialViewSet,
    OrganizationInvitationViewSet,
    OrganizationViewSet,
    UserCreateViewSet,
    UserViewSet,
    invitation_detail,
    invitation_list,
)

router = DefaultRouter(trailing_slash=False)
router.register(r"users", UserViewSet)
router.register(r"users", UserCreateViewSet)
router.register(r"materials", MaterialViewSet)
router.register(r"organizations", OrganizationViewSet)
router.register(r"invitations", OrganizationInvitationViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("invitations/", invitation_list, name="invitation_list",),
    path("invitations/<int:pk>", invitation_detail, name="invitation_detail",),
    path("v1/", include(router.urls)),
    path("api-token-auth/", views.obtain_auth_token),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    # the 'api-root' from django rest-frameworks default router
    # http://www.django-rest-framework.org/api-guide/routers/#defaultrouter
    re_path(r"^$", RedirectView.as_view(url=reverse_lazy("api-root"), permanent=False)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
