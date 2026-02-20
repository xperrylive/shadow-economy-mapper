"""
Evidence service: upload → Supabase Storage → extraction → LedgerEntry normalization.

Public API:
  process_evidence_upload(business, source_type, file_bytes, original_filename, file_size, content_type) -> Evidence
  create_manual_ledger_entry(business, date, total_sales, order_count, notes) -> Evidence

All DB mutations live here; views stay thin.
If packages.extraction is not yet merged the import fails at call time and
evidence is left in QUEUED status — that is intentional and expected.
"""

import logging
from datetime import datetime
from datetime import timezone as dt_timezone
from decimal import Decimal, InvalidOperation

from django.utils import timezone

from core.models import BusinessProfile, Channel, EvidenceStatus, EventType
from core.storage import upload_evidence_file
from .models import Evidence, LedgerEntry

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Public functions
# ---------------------------------------------------------------------------


def process_evidence_upload(
    business: BusinessProfile,
    source_type: str,
    file_bytes: bytes,
    original_filename: str,
    file_size: int,
    content_type: str = "",
) -> Evidence:
    """
    Run the full file-evidence pipeline synchronously.

    Pipeline:
      1. Upload file to Supabase Storage → obtain file_url.
      2. Create Evidence record (status=UPLOADED).
      3. Call packages.extraction.src.extract_evidence → list[RawExtractedEvent].
         - If the package is not available the evidence stays QUEUED (not FAILED).
         - If extraction raises an unexpected exception → FAILED.
      4. Normalize each RawExtractedEvent → LedgerEntry rows (bulk insert).
      5. Mark Evidence NORMALIZED (or FAILED on error).

    Args:
        business: Owning BusinessProfile instance.
        source_type: SourceType string (e.g. "whatsapp", "pdf_bank").
        file_bytes: Raw file content.
        original_filename: Original file name from the upload.
        file_size: File size in bytes.
        content_type: MIME type; inferred from filename when empty.

    Returns:
        The Evidence instance reflecting its final status.
    """
    # --- Step 1: Upload to storage ---
    file_url = upload_evidence_file(file_bytes, original_filename, str(business.id), content_type)

    # --- Step 2: Create Evidence (UPLOADED) ---
    evidence = Evidence.objects.create(
        business=business,
        source_type=source_type,
        file_url=file_url,
        original_filename=original_filename,
        file_size=file_size,
        status=EvidenceStatus.UPLOADED,
    )

    # --- Step 3: Extract ---
    evidence.status = EvidenceStatus.QUEUED
    evidence.save(update_fields=["status"])

    try:
        from packages.extraction.src import extract_evidence  # noqa: PLC0415
    except ImportError:
        # Package not yet merged — leave in QUEUED so extraction can run later.
        logger.warning(
            "packages.extraction not available; evidence %s stays QUEUED.", evidence.id
        )
        return evidence

    try:
        raw_events = extract_evidence(file_bytes, source_type)
    except Exception as exc:
        logger.error("Extraction failed for evidence %s: %s", evidence.id, exc)
        _mark_failed(evidence, f"Extraction error: {exc}")
        return evidence

    evidence.status = EvidenceStatus.EXTRACTED
    evidence.save(update_fields=["status"])

    # --- Step 4: Normalize → LedgerEntry ---
    try:
        count = _normalize_to_ledger(evidence, business, raw_events)
        logger.info("Created %d ledger entries from evidence %s.", count, evidence.id)
    except Exception as exc:
        logger.error("Normalization failed for evidence %s: %s", evidence.id, exc)
        _mark_failed(evidence, f"Normalization error: {exc}")
        return evidence

    # --- Step 5: Mark NORMALIZED ---
    evidence.status = EvidenceStatus.NORMALIZED
    evidence.processed_at = timezone.now()
    evidence.save(update_fields=["status", "processed_at"])

    return evidence


def create_manual_ledger_entry(
    business: BusinessProfile,
    date,
    total_sales: Decimal,
    order_count: int,
    notes: str,
) -> Evidence:
    """
    Handle a manual-entry submission (no file, no extraction needed).

    Creates a synthetic Evidence record and a single LedgerEntry representing
    the day's total sales.

    Args:
        business: Owning BusinessProfile instance.
        date: A ``datetime.date`` object or "YYYY-MM-DD" string.
        total_sales: Total sales amount for the day (MYR).
        order_count: Number of orders completed.
        notes: Free-text notes (e.g. "Pasar malam Thursday").

    Returns:
        The Evidence instance (status=NORMALIZED).
    """
    evidence = Evidence.objects.create(
        business=business,
        source_type="manual",
        file_url="",
        original_filename="manual_entry",
        file_size=0,
        status=EvidenceStatus.NORMALIZED,
        processed_at=timezone.now(),
        metadata={"order_count": order_count, "notes": notes},
    )

    if isinstance(date, str):
        event_time = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=dt_timezone.utc)
    else:
        event_time = datetime(date.year, date.month, date.day, tzinfo=dt_timezone.utc)

    LedgerEntry.objects.create(
        business=business,
        event_time=event_time,
        amount=total_sales,
        currency="MYR",
        channel=Channel.CASH,
        event_type=EventType.PAYMENT,
        source_evidence=evidence,
        confidence=1.0,
        attributes={
            "order_count": order_count,
            "notes": notes,
            "manual_entry": True,
        },
    )

    return evidence


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _mark_failed(evidence: Evidence, message: str) -> None:
    """Set evidence status to FAILED with an error message."""
    evidence.status = EvidenceStatus.FAILED
    evidence.error_message = message
    evidence.processed_at = timezone.now()
    evidence.save(update_fields=["status", "error_message", "processed_at"])


def _get_field(raw, key_snake: str, key_camel: str = ""):
    """
    Read a field from a RawExtractedEvent that may be a dataclass/object or a dict.

    Checks snake_case attribute first, then camelCase attribute, then dict keys.

    Args:
        raw: A RawExtractedEvent instance (dataclass, object, or dict).
        key_snake: Snake_case field name (Python convention).
        key_camel: Optional camelCase alternative (TypeScript convention).

    Returns:
        The field value, or None if not found.
    """
    if hasattr(raw, key_snake):
        return getattr(raw, key_snake)
    if key_camel and hasattr(raw, key_camel):
        return getattr(raw, key_camel)
    if isinstance(raw, dict):
        val = raw.get(key_snake)
        if val is not None:
            return val
        if key_camel:
            return raw.get(key_camel)
    return None


def _normalize_to_ledger(
    evidence: Evidence,
    business: BusinessProfile,
    raw_events: list,
) -> int:
    """
    Convert a list of RawExtractedEvent objects into LedgerEntry rows.

    Skips events with null or zero amounts.
    Defaults unknown channel/event_type to Channel.OTHER / EventType.PAYMENT.
    Uses current time when timestamp is missing or unparseable.

    Args:
        evidence: The source Evidence record (FK for all created entries).
        business: Owning BusinessProfile.
        raw_events: Output from extract_evidence — any object with the
                    RawExtractedEvent contract (dataclass, dict, etc.).

    Returns:
        Number of LedgerEntry rows created.
    """
    entries = []

    for raw in raw_events:
        # --- timestamp ---
        raw_ts = _get_field(raw, "timestamp")
        if raw_ts:
            try:
                ts_str = str(raw_ts).replace("Z", "+00:00")
                event_time = datetime.fromisoformat(ts_str)
                if event_time.tzinfo is None:
                    event_time = event_time.replace(tzinfo=dt_timezone.utc)
            except (ValueError, TypeError):
                event_time = timezone.now()
        else:
            event_time = timezone.now()

        # --- amount (skip null / zero) ---
        raw_amount = _get_field(raw, "amount")
        if raw_amount is None:
            continue
        try:
            amount = Decimal(str(raw_amount)).quantize(Decimal("0.01"))
        except InvalidOperation:
            continue
        if amount == 0:
            continue

        # --- channel ---
        raw_channel = _get_field(raw, "channel")
        channel = raw_channel if raw_channel in Channel.values else Channel.OTHER

        # --- event_type ---
        raw_event_type = _get_field(raw, "event_type", "eventType")
        event_type = (
            raw_event_type if raw_event_type in EventType.values else EventType.PAYMENT
        )

        # --- confidence ---
        raw_confidence = _get_field(raw, "confidence")
        confidence = float(raw_confidence) if raw_confidence is not None else 0.5

        # --- attributes ---
        attributes: dict = {"description": _get_field(raw, "description") or ""}
        raw_text = _get_field(raw, "raw_text", "rawText")
        if raw_text:
            attributes["raw_text"] = raw_text
        metadata = _get_field(raw, "metadata")
        if isinstance(metadata, dict):
            attributes.update(metadata)

        entries.append(
            LedgerEntry(
                business=business,
                event_time=event_time,
                amount=amount,
                currency=_get_field(raw, "currency") or "MYR",
                channel=channel,
                event_type=event_type,
                source_evidence=evidence,
                confidence=confidence,
                attributes=attributes,
            )
        )

    if entries:
        LedgerEntry.objects.bulk_create(entries)

    return len(entries)
