"""Core URL routing."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BusinessProfileViewSet

router = DefaultRouter()
router.register(r"businesses", BusinessProfileViewSet, basename="business")

urlpatterns = [
    path("", include(router.urls)),
]
