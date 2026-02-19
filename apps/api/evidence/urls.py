"""Evidence URL routing."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvidenceViewSet, LedgerViewSet, ScoreViewSet

router = DefaultRouter()
router.register(r"items", EvidenceViewSet, basename="evidence")
router.register(r"ledger", LedgerViewSet, basename="ledger")
router.register(r"scores", ScoreViewSet, basename="score")

urlpatterns = [
    path("", include(router.urls)),
]
