"""Report models: generated PDF reports and share tokens."""

import uuid
import secrets
from django.db import models
from core.models import BusinessProfile


class Report(models.Model):
    """A generated PDF report for a business."""

    class ReportType(models.TextChoices):
        SME = "sme", "SME Report (Friendly)"
        VERIFIER = "verifier", "Verifier Report (Strict)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(
        BusinessProfile, on_delete=models.CASCADE, related_name="reports"
    )
    report_type = models.CharField(max_length=20, choices=ReportType.choices)
    pdf_url = models.URLField(max_length=500, blank=True, default="")
    data_snapshot = models.JSONField(default=dict, help_text="Score + insights at time of generation")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reports"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.report_type} report for {self.business.name}"


class ShareToken(models.Model):
    """A time-limited token for sharing a report with a verifier."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(
        Report, on_delete=models.CASCADE, related_name="share_tokens"
    )
    token = models.CharField(max_length=64, unique=True, default=secrets.token_urlsafe)
    expires_at = models.DateTimeField()
    access_count = models.IntegerField(default=0)
    max_access = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "share_tokens"

    def __str__(self):
        return f"Token for {self.report} (expires {self.expires_at})"
