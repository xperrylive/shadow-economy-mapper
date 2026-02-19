"""Evidence views: upload, list, ledger, and score endpoints."""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from core.models import BusinessProfile
from .models import Evidence, LedgerEntry, CredibilityScore
from .serializers import (
    EvidenceSerializer,
    EvidenceUploadSerializer,
    LedgerEntrySerializer,
    CredibilityScoreSerializer,
)


class EvidenceViewSet(viewsets.ModelViewSet):
    """Manage evidence uploads for a business."""

    serializer_class = EvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Evidence.objects.filter(business__user=self.request.user)

    @action(detail=False, methods=["post"])
    def upload(self, request):
        """
        Upload a new piece of evidence.

        POST /api/evidence/upload/
        Body: multipart form with business_id, source_type, file
        """
        serializer = EvidenceUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        business = get_object_or_404(
            BusinessProfile,
            id=serializer.validated_data["business_id"],
            user=request.user,
        )

        # TODO (Person 2): Upload file to Supabase Storage
        # TODO (Person 2): Create evidence record
        # TODO (Person 2): Queue extraction job

        # Placeholder response
        return Response(
            {
                "evidence_id": "placeholder",
                "status": "UPLOADED",
                "message": "Evidence received. Extraction will begin shortly.",
            },
            status=status.HTTP_201_CREATED,
        )


class LedgerViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to normalized ledger entries."""

    serializer_class = LedgerEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["business", "channel", "event_type"]

    def get_queryset(self):
        qs = LedgerEntry.objects.filter(business__user=self.request.user)

        # Optional date range filters
        date_from = self.request.query_params.get("from")
        date_to = self.request.query_params.get("to")
        business_id = self.request.query_params.get("business_id")

        if business_id:
            qs = qs.filter(business_id=business_id)
        if date_from:
            qs = qs.filter(event_time__gte=date_from)
        if date_to:
            qs = qs.filter(event_time__lte=date_to)

        return qs


class ScoreViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to credibility scores."""

    serializer_class = CredibilityScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CredibilityScore.objects.filter(business__user=self.request.user)

    @action(detail=False, methods=["post"])
    def compute(self, request):
        """
        Trigger score computation for a business.

        POST /api/evidence/scores/compute/
        Body: { "business_id": "uuid" }
        """
        business_id = request.data.get("business_id")
        business = get_object_or_404(
            BusinessProfile, id=business_id, user=request.user
        )

        # TODO (Person 2 + Person 4): Call scoring engine
        # entries = LedgerEntry.objects.filter(business=business)
        # score = scoring.compute_score(entries)

        return Response(
            {"message": "Score computation queued.", "business_id": str(business.id)},
            status=status.HTTP_202_ACCEPTED,
        )
