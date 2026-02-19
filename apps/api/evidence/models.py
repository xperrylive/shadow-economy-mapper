"""Evidence models: uploads, ledger entries, event links, and scores."""

import uuid
from django.db import models
from core.models import (
    BusinessProfile,
    SourceType,
    Channel,
    EventType,
    EvidenceStatus,
    ConfidenceLevel,
)


class Evidence(models.Model):
    """An uploaded piece of evidence (file, manual entry, voice note)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(
        BusinessProfile, on_delete=models.CASCADE, related_name="evidence"
    )
    source_type = models.CharField(max_length=20, choices=SourceType.choices)
    file_url = models.URLField(max_length=500, blank=True, default="")
    original_filename = models.CharField(max_length=255, blank=True, default="")
    file_size = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=EvidenceStatus.choices, default=EvidenceStatus.UPLOADED
    )
    error_message = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "evidence"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.source_type} - {self.original_filename} ({self.status})"


class LedgerEntry(models.Model):
    """A normalized transaction event from any source."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(
        BusinessProfile, on_delete=models.CASCADE, related_name="ledger_entries"
    )
    event_time = models.DateTimeField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="MYR")
    channel = models.CharField(max_length=20, choices=Channel.choices)
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    source_evidence = models.ForeignKey(
        Evidence, on_delete=models.CASCADE, related_name="ledger_entries"
    )
    confidence = models.FloatField(
        default=0.0, help_text="Confidence score 0.0 - 1.0"
    )
    attributes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ledger_entries"
        ordering = ["-event_time"]
        indexes = [
            models.Index(fields=["business", "event_time"]),
            models.Index(fields=["business", "channel"]),
        ]

    def __str__(self):
        return f"{self.event_type} {self.amount} {self.currency} @ {self.event_time}"


class EventLink(models.Model):
    """A cross-source link between two ledger entries."""

    class LinkType(models.TextChoices):
        AMOUNT_MATCH = "amount_match"
        TIME_MATCH = "time_match"
        KEYWORD_MATCH = "keyword_match"
        CROSS_CHANNEL = "cross_channel"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entry_a = models.ForeignKey(
        LedgerEntry, on_delete=models.CASCADE, related_name="links_as_a"
    )
    entry_b = models.ForeignKey(
        LedgerEntry, on_delete=models.CASCADE, related_name="links_as_b"
    )
    link_type = models.CharField(max_length=20, choices=LinkType.choices)
    similarity_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "event_links"
        unique_together = ["entry_a", "entry_b"]


class CredibilityScore(models.Model):
    """Computed credibility score for a business."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(
        BusinessProfile, on_delete=models.CASCADE, related_name="scores"
    )
    score = models.IntegerField(help_text="0-100")
    confidence_level = models.CharField(max_length=10, choices=ConfidenceLevel.choices)
    breakdown = models.JSONField(
        default=dict,
        help_text="Transparent score breakdown: activity, consistency, longevity, etc.",
    )
    flags = models.JSONField(default=list, help_text="Quality/anomaly flags")
    insights = models.JSONField(default=list, help_text="Insight cards")
    computed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "credibility_scores"
        ordering = ["-computed_at"]
        get_latest_by = "computed_at"

    def __str__(self):
        return f"Score {self.score} ({self.confidence_level}) for {self.business.name}"
