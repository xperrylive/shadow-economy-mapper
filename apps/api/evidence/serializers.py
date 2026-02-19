"""Serializers for evidence, ledger, and scoring models."""

from rest_framework import serializers
from .models import Evidence, LedgerEntry, CredibilityScore


class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = [
            "id", "business", "source_type", "file_url", "original_filename",
            "file_size", "status", "error_message", "metadata",
            "uploaded_at", "processed_at",
        ]
        read_only_fields = [
            "id", "file_url", "file_size", "status", "error_message",
            "metadata", "uploaded_at", "processed_at",
        ]


class EvidenceUploadSerializer(serializers.Serializer):
    """Serializer for the upload endpoint."""
    business_id = serializers.UUIDField()
    source_type = serializers.ChoiceField(choices=[
        "whatsapp", "telegram", "instagram",
        "csv_grab", "csv_shopee", "csv_foodpanda",
        "pdf_bank", "pdf_ewallet", "screenshot",
        "manual", "voice",
    ])
    file = serializers.FileField(required=False)
    # Manual entry fields
    date = serializers.DateField(required=False)
    total_sales = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    order_count = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class LedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerEntry
        fields = [
            "id", "business", "event_time", "amount", "currency",
            "channel", "event_type", "source_evidence",
            "confidence", "attributes", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class CredibilityScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CredibilityScore
        fields = [
            "id", "business", "score", "confidence_level",
            "breakdown", "flags", "insights", "computed_at",
        ]
        read_only_fields = fields
