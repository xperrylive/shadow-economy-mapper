"""
Anomaly & Data Quality Detection.

Not "catching fraud" — estimating data quality and confidence.

Person 4 owns this file.
"""

from ..types import LedgerEntryInput


def detect_anomalies(entries: list[LedgerEntryInput]) -> list[str]:
    """
    Detect data quality issues and suspicious patterns.

    Returns a list of flag strings.
    """
    flags = []

    if _has_spikes(entries):
        flags.append("spike_detected")

    if _has_suspicious_round_numbers(entries):
        flags.append("round_numbers_suspicious")

    if _has_uniform_intervals(entries):
        flags.append("uniform_intervals")

    if _has_missing_periods(entries):
        flags.append("missing_period")

    return flags


def _has_spikes(entries: list[LedgerEntryInput]) -> bool:
    """Detect unusual spikes in weekly totals using z-score."""
    # TODO (Person 4): Implement z-score or IQR based spike detection
    # Group entries by week, compute weekly totals, flag outliers
    return False


def _has_suspicious_round_numbers(entries: list[LedgerEntryInput]) -> bool:
    """Detect if too many entries are round numbers (RM100, RM200)."""
    # TODO (Person 4): Implement
    # If >80% of amounts are multiples of 10/50/100, flag it
    if not entries:
        return False
    round_count = sum(1 for e in entries if e["amount"] and e["amount"] % 10 == 0)
    return round_count / len(entries) > 0.8


def _has_uniform_intervals(entries: list[LedgerEntryInput]) -> bool:
    """Detect suspiciously evenly-spaced entries."""
    # TODO (Person 4): Implement
    return False


def _has_missing_periods(entries: list[LedgerEntryInput]) -> bool:
    """Detect gaps in activity (e.g., 2 weeks with no entries)."""
    # TODO (Person 4): Implement
    # Sort by date, check for gaps > 14 days
    return False
