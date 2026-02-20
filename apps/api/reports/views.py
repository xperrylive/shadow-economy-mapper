"""Report views: generate, list, share, and public-verify reports."""

import logging

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, serializers as drf_serializers, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from core.models import BusinessProfile
from .models import Report, ShareToken
from .services import process_report_generate

logger = logging.getLogger(__name__)


class ReportSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["id", "business", "report_type", "pdf_url", "data_snapshot", "created_at"]
        read_only_fields = fields


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(business__user=self.request.user)

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """
        Generate a new report.

        POST /api/reports/generate/
        Body: { "business_id": "uuid", "report_type": "sme" | "verifier" }
        """
        business_id = request.data.get("business_id")
        report_type = request.data.get("report_type", "sme")

        business = get_object_or_404(
            BusinessProfile, id=business_id, user=request.user
        )

        try:
            process_report_generate(business, report_type)
        except ValueError as exc:
            return Response(
                {"error": True, "message": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            logger.error("Report generation failed for business %s: %s", business_id, exc)
            return Response(
                {"error": True, "message": f"Report generation failed: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "Report generation queued.", "business_id": str(business.id)},
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        """Create a share token for a report."""
        report = self.get_object()
        hours = int(request.data.get("expires_in_hours", 72))
        expires_at = timezone.now() + timezone.timedelta(hours=hours)

        token = ShareToken.objects.create(report=report, expires_at=expires_at)

        return Response({
            "token": token.token,
            "share_url": f"/verify/{token.token}",
            "expires_at": expires_at.isoformat(),
        })


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def verify_report(request, token):
    """
    Public endpoint: view a shared report via token.

    GET /api/reports/verify/<token>/
    """
    share_token = get_object_or_404(ShareToken, token=token)

    if timezone.now() > share_token.expires_at:
        return Response(
            {"error": "This share link has expired."},
            status=status.HTTP_410_GONE,
        )

    if share_token.access_count >= share_token.max_access:
        return Response(
            {"error": "This share link has reached its access limit."},
            status=status.HTTP_410_GONE,
        )

    share_token.access_count += 1
    share_token.save(update_fields=["access_count"])

    report = share_token.report
    return Response(ReportSerializer(report).data)
