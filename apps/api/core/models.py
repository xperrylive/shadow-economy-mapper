"""Core models: business profiles, consent, and shared enums."""

import uuid
from django.db import models
from django.contrib.auth.models import User


class SourceType(models.TextChoices):
    WHATSAPP = "whatsapp"
    TELEGRAM = "telegram"
    INSTAGRAM = "instagram"
    CSV_GRAB = "csv_grab"
    CSV_SHOPEE = "csv_shopee"
    CSV_FOODPANDA = "csv_foodpanda"
    PDF_BANK = "pdf_bank"
    PDF_EWALLET = "pdf_ewallet"
    SCREENSHOT = "screenshot"
    MANUAL = "manual"
    VOICE = "voice"


class Channel(models.TextChoices):
    WHATSAPP = "whatsapp"
    GRABFOOD = "grabfood"
    SHOPEE = "shopee"
    FOODPANDA = "foodpanda"
    LAZADA = "lazada"
    TNG = "tng"
    BANK = "bank"
    CASH = "cash"
    OTHER = "other"


class EventType(models.TextChoices):
    ORDER = "order"
    PAYMENT = "payment"
    PAYOUT = "payout"
    REFUND = "refund"


class EvidenceStatus(models.TextChoices):
    UPLOADED = "UPLOADED"
    QUEUED = "QUEUED"
    EXTRACTED = "EXTRACTED"
    NORMALIZED = "NORMALIZED"
    ANALYZED = "ANALYZED"
    REPORTED = "REPORTED"
    FAILED = "FAILED"


class ConfidenceLevel(models.TextChoices):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class BusinessProfile(models.Model):
    """A micro-business registered by a user."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="businesses")
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    channels = models.JSONField(default=list, help_text="List of active channels")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "business_profiles"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.user.email})"


class ConsentSettings(models.Model):
    """Privacy and sharing preferences for a business."""

    class ShareMode(models.TextChoices):
        PRIVATE = "private"
        TOKEN_ONLY = "token_only"
        PUBLIC = "public"

    business = models.OneToOneField(
        BusinessProfile, on_delete=models.CASCADE, related_name="consent"
    )
    share_mode = models.CharField(
        max_length=20, choices=ShareMode.choices, default=ShareMode.TOKEN_ONLY
    )
    redact_pii = models.BooleanField(default=True)
    store_raw_files = models.BooleanField(default=True)
    risk_disclosure_accepted = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "consent_settings"

    def __str__(self):
        return f"Consent for {self.business.name}"
