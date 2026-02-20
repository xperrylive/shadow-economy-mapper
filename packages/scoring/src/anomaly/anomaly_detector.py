"""
Anomaly & Data Quality Detection.

Not "catching fraud" — estimating data quality and confidence.

Person 4 owns this file.
"""

import statistics
from collections import defaultdict
from datetime import datetime, timedelta

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
    if len(entries) < 4:
        return False

    weekly: dict[tuple[int, int], float] = defaultdict(float)
    for e in entries:
        dt = datetime.fromisoformat(e["event_time"].replace("Z", "+00:00"))
        cal = dt.isocalendar()
        weekly[(cal.year, cal.week)] += e["amount"]

    totals = list(weekly.values())
    if len(totals) < 4:
        return False

    quartiles = statistics.quantiles(totals, n=4)
    q1, q3 = quartiles[0], quartiles[2]
    iqr = q3 - q1
    if iqr == 0:
        return False

    upper_fence = q3 + 1.5 * iqr
    return any(t > upper_fence for t in totals)


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
    if len(entries) < 5:
        return False

    sorted_entries = sorted(entries, key=lambda e: e["event_time"])
    timestamps = [
        datetime.fromisoformat(e["event_time"].replace("Z", "+00:00")).timestamp()
        for e in sorted_entries
    ]
    intervals = [timestamps[i + 1] - timestamps[i] for i in range(len(timestamps) - 1)]
    intervals = [iv for iv in intervals if iv > 0]

    if len(intervals) < 4:
        return False

    mean = statistics.mean(intervals)
    if mean == 0:
        return False

    cv = statistics.stdev(intervals) / mean
    return cv < 0.05


def _has_missing_periods(entries: list[LedgerEntryInput]) -> bool:
    """Detect gaps in activity (e.g., 2 weeks with no entries)."""
    if len(entries) < 2:
        return False

    sorted_times = sorted(
        datetime.fromisoformat(e["event_time"].replace("Z", "+00:00"))
        for e in entries
    )

    total_span = (sorted_times[-1] - sorted_times[0]).days
    if total_span < 28:
        return False

    gap_threshold = timedelta(days=14)
    for i in range(len(sorted_times) - 1):
        if sorted_times[i + 1] - sorted_times[i] > gap_threshold:
            return True

    return False
