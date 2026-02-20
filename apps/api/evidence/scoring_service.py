"""
Scoring service: fetch ledger entries → call Person 4's functions → save CredibilityScore.

Public API:
    compute_and_save_score(business) -> CredibilityScore

Raises ImportError when packages.scoring is not yet merged (caller handles it).
Raises any other exception on computation failures (caller handles it).
"""

import logging

from core.models import BusinessProfile, ConfidenceLevel
from .models import CredibilityScore, LedgerEntry

logger = logging.getLogger(__name__)

_VALID_CONFIDENCE = {c.value for c in ConfidenceLevel}


def compute_and_save_score(business: BusinessProfile) -> CredibilityScore:
    """
    Run the full scoring pipeline for a business and persist the result.

    Fetches all ledger entries for the business, converts them to plain dicts,
    delegates to Person 4's compute_score + generate_insights, then saves a
    new CredibilityScore row.

    Args:
        business: The BusinessProfile to score.

    Returns:
        The newly created CredibilityScore instance.

    Raises:
        ImportError: If packages.scoring is not yet available.
        Exception: On any computation error.
    """
    entries = LedgerEntry.objects.filter(business=business).order_by("event_time")
    entry_dicts = [_entry_to_dict(e) for e in entries]

    # Deferred import — raises ImportError when package not merged yet.
    from packages.scoring.src import compute_score, generate_insights  # noqa: PLC0415

    raw_score = compute_score(entry_dicts)
    raw_insights = generate_insights(entry_dicts)

    score_value = _get(raw_score, "score") or 0
    confidence_level = _get(raw_score, "confidence_level", "confidenceLevel") or ConfidenceLevel.LOW
    breakdown = _get(raw_score, "breakdown") or {}
    flags = _get(raw_score, "flags") or []

    # Guard against unexpected confidence_level values.
    if confidence_level not in _VALID_CONFIDENCE:
        confidence_level = ConfidenceLevel.LOW

    insights_list = [_insight_to_dict(i) for i in (raw_insights or [])]

    score = CredibilityScore.objects.create(
        business=business,
        score=int(score_value),
        confidence_level=confidence_level,
        breakdown=dict(breakdown) if hasattr(breakdown, "items") else {},
        flags=list(flags),
        insights=insights_list,
    )
    logger.info(
        "Saved CredibilityScore %s (score=%d) for business %s.",
        score.id, score.score, business.id,
    )
    return score


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _entry_to_dict(entry: LedgerEntry) -> dict:
    """Convert a LedgerEntry instance to a plain dict for Person 4's functions."""
    return {
        "id": str(entry.id),
        "business_id": str(entry.business_id),
        "event_time": entry.event_time.isoformat(),
        "amount": float(entry.amount),
        "currency": entry.currency,
        "channel": entry.channel,
        "event_type": entry.event_type,
        "source_evidence_id": str(entry.source_evidence_id),
        "confidence": entry.confidence,
        "attributes": entry.attributes or {},
        "created_at": entry.created_at.isoformat(),
    }


def _get(obj, key_snake: str, key_camel: str = ""):
    """Read a field from a dataclass/object or dict, trying snake_case then camelCase."""
    if hasattr(obj, key_snake):
        return getattr(obj, key_snake)
    if key_camel and hasattr(obj, key_camel):
        return getattr(obj, key_camel)
    if isinstance(obj, dict):
        val = obj.get(key_snake)
        if val is not None:
            return val
        if key_camel:
            return obj.get(key_camel)
    return None


def _insight_to_dict(insight) -> dict:
    """Normalise an InsightCard (dataclass, object, or dict) to a plain dict."""
    if isinstance(insight, dict):
        return insight
    return {
        "type": getattr(insight, "type", ""),
        "title": getattr(insight, "title", ""),
        "description": getattr(insight, "description", ""),
        "data": getattr(insight, "data", None),
    }
