"""Root URL configuration."""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("core.urls")),
    path("api/evidence/", include("evidence.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/organizations/", include("organizations.urls")),
]
