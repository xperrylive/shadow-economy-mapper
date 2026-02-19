"""Reports URL routing."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, verify_report

router = DefaultRouter()
router.register(r"", ReportViewSet, basename="report")

urlpatterns = [
    path("verify/<str:token>/", verify_report, name="verify-report"),
    path("", include(router.urls)),
]
