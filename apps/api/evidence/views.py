"""Evidence views: upload, list, ledger, and score endpoints."""

import logging
from decimal import Decimal

logger = logging.getLogger(__name__)

from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.models import BusinessProfile
from .models import CredibilityScore, Evidence, LedgerEntry
from .serializers import (
    CredibilityScoreSerializer,
    EvidenceSerializer,
    EvidenceUploadSerializer,
    LedgerEntrySerializer,
)
from .services import create_manual_ledger_entry, process_evidence_upload


class EvidenceViewSet(viewsets.ModelViewSet):
    """Manage evidence uploads for a business."""

    serializer_class = EvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Evidence.objects.filter(business__user=self.request.user)
        business_id = self.request.query_params.get("business_id")
        if business_id:
            qs = qs.filter(business_id=business_id)
        return qs

    @action(detail=False, methods=["post"])
    def upload(self, request):
        """
        Upload a file or submit a manual entry.

        File upload  — multipart/form-data:
            business_id, source_type, file

        Manual entry — application/json:
            business_id, source_type="manual", date, total_sales, order_count, notes
        """
        serializer = EvidenceUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        business = get_object_or_404(
            BusinessProfile,
            id=data["business_id"],
            user=request.user,
        )

        source_type = data["source_type"]

        if source_type == "manual":
            evidence = create_manual_ledger_entry(
                business=business,
                date=data.get("date"),
                total_sales=data.get("total_sales", Decimal("0.00")),
                order_count=data.get("order_count", 0),
                notes=data.get("notes", ""),
            )
        else:
            uploaded_file = data.get("file")
            if not uploaded_file:
                return Response(
                    {
                        "error": True,
                        "message": "A file is required for non-manual source types.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            evidence = process_evidence_upload(
                business=business,
                source_type=source_type,
                file_bytes=uploaded_file.read(),
                original_filename=uploaded_file.name,
                file_size=uploaded_file.size,
                content_type=getattr(uploaded_file, "content_type", ""),
            )

        return Response(
            {
                "evidence_id": str(evidence.id),
                "status": evidence.status,
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
        qs = CredibilityScore.objects.filter(business__user=self.request.user)
        business_id = self.request.query_params.get("business_id")
        if business_id:
            qs = qs.filter(business_id=business_id)
        return qs

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

        try:
            from .scoring_service import compute_and_save_score
            compute_and_save_score(business)
        except ImportError:
            logger.warning(
                "packages.scoring not available; score not computed for business %s.",
                business_id,
            )
        except Exception as exc:
            logger.error("Score computation failed for business %s: %s", business_id, exc)
            return Response(
                {"error": True, "message": f"Score computation failed: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "Score computation queued.", "business_id": str(business.id)},
            status=status.HTTP_202_ACCEPTED,
        )
