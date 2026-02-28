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

import statistics
from collections import defaultdict
from datetime import datetime

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
    """
    Score based on active weeks and average transactions per active week. Max 30.

    Split into two equal halves:
      - Active weeks score  (0-15): how many distinct weeks have any activity
      - Frequency score     (0-15): average transactions per active week

    This way a business with 100 entries in a single week scores lower than
    one with 50 entries spread consistently over 6 months.
    """
    if not entries:
        return 0.0

    # Count distinct active weeks
    active_weeks: set[tuple[int, int]] = set()
    for e in entries:
        dt = datetime.fromisoformat(e["event_time"].replace("Z", "+00:00"))
        cal = dt.isocalendar()
        active_weeks.add((cal.year, cal.week))

    n_active_weeks = len(active_weeks)
    avg_per_week = len(entries) / n_active_weeks

    # Active weeks score (0-15)
    if n_active_weeks >= 26:       # 6+ months
        week_score = 15.0
    elif n_active_weeks >= 13:     # 3-6 months
        week_score = 13.0
    elif n_active_weeks >= 8:      # 2-3 months
        week_score = 11.0
    elif n_active_weeks >= 4:      # 1-2 months
        week_score = 8.0
    elif n_active_weeks >= 2:
        week_score = 5.0
    else:
        week_score = 2.0

    # Frequency score (0-15): avg transactions per active week
    if avg_per_week >= 20:
        freq_score = 15.0
    elif avg_per_week >= 10:
        freq_score = 13.0
    elif avg_per_week >= 5:
        freq_score = 10.0
    elif avg_per_week >= 3:
        freq_score = 7.0
    elif avg_per_week >= 1:
        freq_score = 4.0
    else:
        freq_score = 2.0

    return round(week_score + freq_score, 1)


def _compute_consistency_score(entries: list[LedgerEntryInput]) -> float:
    """Score based on consistent activity over time. Max 20."""
    weekly: dict[tuple[int, int], float] = defaultdict(float)
    for e in entries:
        dt = datetime.fromisoformat(e["event_time"].replace("Z", "+00:00"))
        cal = dt.isocalendar()
        weekly[(cal.year, cal.week)] += e["amount"]

    totals = list(weekly.values())
    n_weeks = len(totals)

    if n_weeks == 1:
        return 5.0  # One week — no consistency signal yet

    if n_weeks < 4:
        return 10.0  # Too few weeks for reliable CV; partial credit

    mean = statistics.mean(totals)
    if mean == 0:
        return 0.0

    cv = statistics.stdev(totals) / mean
    if cv <= 0.20:
        return 20.0
    if cv <= 0.40:
        return 16.0
    if cv <= 0.60:
        return 12.0
    if cv <= 0.80:
        return 8.0
    if cv <= 1.00:
        return 5.0
    return 2.0


def _compute_longevity_score(entries: list[LedgerEntryInput]) -> float:
    """Score based on how far back evidence goes. Max 20."""
    times = [
        datetime.fromisoformat(e["event_time"].replace("Z", "+00:00"))
        for e in entries
    ]
    span_days = (max(times) - min(times)).days

    if span_days < 7:
        return 2.0
    if span_days < 30:
        return 5.0
    if span_days < 90:
        return 10.0
    if span_days < 180:
        return 14.0
    if span_days < 365:
        return 17.0
    return 20.0


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
