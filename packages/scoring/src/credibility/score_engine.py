"""
Credibility Scoring Engine.

Produces a transparent 0-100 score with full breakdown.

Person 4 owns this file.

Score composition:
  Activity consistency  : 0-30 points
  Longevity             : 0-20 points
  Evidence strength     : 0-25 points
  Cross-source confirms : 0-15 points
  Penalties             : -20 to 0 points
  TOTAL                 : 0-100
"""

from ..types import CredibilityScore, ScoreBreakdown, LedgerEntryInput
from ..anomaly.anomaly_detector import detect_anomalies
from ..linking.cross_source_linker import compute_cross_source_score


def compute_score(entries: list[LedgerEntryInput]) -> CredibilityScore:
    """
    Compute credibility score from ledger entries.

    This is a PURE function — no DB calls, no side effects.

    Args:
        entries: List of normalized ledger entries

    Returns:
        CredibilityScore with score, confidence level, and breakdown
    """
    if not entries:
        return CredibilityScore(
            score=0,
            confidence_level="LOW",
            breakdown=_empty_breakdown(),
            flags=["no_data"],
        )

    # Compute individual components
    activity = _compute_activity_score(entries)
    consistency = _compute_consistency_score(entries)
    longevity = _compute_longevity_score(entries)
    evidence_strength = _compute_evidence_strength_score(entries)
    cross_source = compute_cross_source_score(entries)

    # Detect anomalies and apply penalties
    flags = detect_anomalies(entries)
    penalties = _apply_penalties(flags)

    raw_score = activity + consistency + longevity + evidence_strength + cross_source + penalties
    score = max(0, min(100, round(raw_score)))

    return CredibilityScore(
        score=score,
        confidence_level=_score_to_confidence(score, len(entries)),
        breakdown=ScoreBreakdown(
            activity=round(activity, 1),
            consistency=round(consistency, 1),
            longevity=round(longevity, 1),
            evidence_strength=round(evidence_strength, 1),
            cross_source=round(cross_source, 1),
            penalties=round(penalties, 1),
        ),
        flags=flags,
    )


def _compute_activity_score(entries: list[LedgerEntryInput]) -> float:
    """Score based on volume and frequency of activity. Max 30."""
    # TODO (Person 4): Implement
    # Consider: total transaction count, average per week, regularity
    count = len(entries)
    if count >= 100:
        return 30.0
    if count >= 50:
        return 25.0
    if count >= 20:
        return 18.0
    if count >= 5:
        return 10.0
    return 3.0


def _compute_consistency_score(entries: list[LedgerEntryInput]) -> float:
    """Score based on consistent activity over time. Max 20."""
    # TODO (Person 4): Implement
    # Consider: coefficient of variation in weekly totals, gap analysis
    return 10.0  # Placeholder


def _compute_longevity_score(entries: list[LedgerEntryInput]) -> float:
    """Score based on how far back evidence goes. Max 20."""
    # TODO (Person 4): Implement
    # Consider: date range of earliest to latest entry
    return 10.0  # Placeholder


def _compute_evidence_strength_score(entries: list[LedgerEntryInput]) -> float:
    """Score based on source quality. Max 25. CSV > PDF > chat > manual."""
    # TODO (Person 4): Implement
    # Weight by confidence values and source diversity
    avg_confidence = sum(e["confidence"] for e in entries) / len(entries)
    return round(avg_confidence * 25, 1)


def _apply_penalties(flags: list[str]) -> float:
    """Deduct points for anomalies. Range: -20 to 0."""
    penalty_map = {
        "spike_detected": -5,
        "round_numbers_suspicious": -3,
        "uniform_intervals": -4,
        "duplicate_upload": -5,
        "missing_period": -3,
    }
    total = sum(penalty_map.get(flag, -1) for flag in flags)
    return max(-20, total)


def _score_to_confidence(score: int, entry_count: int) -> str:
    """Map score + data volume to confidence level."""
    if entry_count < 5 or score < 30:
        return "LOW"
    if entry_count < 20 or score < 60:
        return "MEDIUM"
    return "HIGH"


def _empty_breakdown() -> ScoreBreakdown:
    return ScoreBreakdown(
        activity=0, consistency=0, longevity=0,
        evidence_strength=0, cross_source=0, penalties=0,
    )
