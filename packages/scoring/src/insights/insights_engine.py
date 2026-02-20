"""
Insights Engine — actionable, not financial advice.

Person 4 owns this file.
"""

from collections import defaultdict
from datetime import datetime, timedelta

from ..types import InsightCard, LedgerEntryInput

_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def generate_insights(entries: list[LedgerEntryInput]) -> list[InsightCard]:
    """
    Generate insight cards from ledger entries.

    Pure function — no DB, no side effects.

    Args:
        entries: Normalized ledger entries

    Returns:
        List of InsightCard dicts
    """
    if not entries:
        return [InsightCard(
            type="recommendation",
            title="Upload your first evidence",
            description="Start by uploading a WhatsApp chat export or platform CSV to build your financial story.",
            data=None,
        )]

    insights = []

    peak = _detect_peak_days(entries)
    if peak:
        insights.append(peak)

    trend = _detect_trend(entries)
    if trend:
        insights.append(trend)

    coverage = _compute_coverage(entries)
    if coverage:
        insights.append(coverage)

    rec = _suggest_improvements(entries)
    if rec:
        insights.append(rec)

    return insights


def _detect_peak_days(entries: list[LedgerEntryInput]) -> InsightCard | None:
    """Find the busiest days of the week."""
    day_totals: dict[int, float] = defaultdict(float)
    for e in entries:
        dt = datetime.fromisoformat(e["event_time"].replace("Z", "+00:00"))
        day_totals[dt.weekday()] += e["amount"]

    if not day_totals:
        return None

    # Sort by total descending; break ties by weekday index for stability
    ranked = sorted(day_totals.keys(), key=lambda d: (-day_totals[d], d))
    top = ranked[:2]
    top_names = [_DAY_NAMES[d] for d in top]

    title = (
        f"Busiest day: {top_names[0]}"
        if len(top) == 1
        else f"Busiest days: {top_names[0]} & {top_names[1]}"
    )
    description = (
        f"Most of your revenue comes on {' and '.join(top_names)}. "
        "Consider preparing extra inventory or capacity on those days."
    )

    return InsightCard(
        type="peak_day",
        title=title,
        description=description,
        data={
            "peak_days": top_names,
            "day_totals": {_DAY_NAMES[d]: round(day_totals[d], 2) for d in sorted(day_totals)},
        },
    )


def _detect_trend(entries: list[LedgerEntryInput]) -> InsightCard | None:
    """Detect growth or decline trends in weekly totals."""
    if len(entries) < 4:
        return None

    times = [
        datetime.fromisoformat(e["event_time"].replace("Z", "+00:00"))
        for e in entries
    ]
    latest = max(times)

    if (latest - min(times)).days < 28:
        return None

    cutoff = latest - timedelta(days=14)
    prior_cutoff = cutoff - timedelta(days=14)

    recent_total = sum(
        e["amount"] for e, t in zip(entries, times) if t > cutoff
    )
    previous_total = sum(
        e["amount"] for e, t in zip(entries, times) if prior_cutoff < t <= cutoff
    )

    if previous_total == 0:
        return None

    change_pct = (recent_total - previous_total) / previous_total * 100

    if change_pct > 20:
        direction = "up"
        title = "Revenue trending up"
        description = (
            f"Revenue for the last 14 days is {change_pct:.0f}% higher than the prior 14 days "
            f"(RM {recent_total:.2f} vs RM {previous_total:.2f})."
        )
    elif change_pct < -20:
        direction = "down"
        title = "Revenue trending down"
        description = (
            f"Revenue for the last 14 days is {abs(change_pct):.0f}% lower than the prior 14 days "
            f"(RM {recent_total:.2f} vs RM {previous_total:.2f})."
        )
    else:
        direction = "flat"
        title = "Revenue holding steady"
        description = (
            f"Revenue is consistent: RM {recent_total:.2f} (last 14 days) "
            f"vs RM {previous_total:.2f} (prior 14 days)."
        )

    return InsightCard(
        type="trend",
        title=title,
        description=description,
        data={
            "direction": direction,
            "recent_total": round(recent_total, 2),
            "previous_total": round(previous_total, 2),
            "change_pct": round(change_pct, 1),
        },
    )


def _compute_coverage(entries: list[LedgerEntryInput]) -> InsightCard | None:
    """Show how many channels have evidence."""
    channels = set(e["channel"] for e in entries)
    return InsightCard(
        type="coverage",
        title=f"Evidence from {len(channels)} channel(s)",
        description=f"You have evidence from: {', '.join(channels)}. Adding more channels increases your credibility score.",
        data={"channels": list(channels)},
    )


def _suggest_improvements(entries: list[LedgerEntryInput]) -> InsightCard | None:
    """Suggest what the user can do to improve their score."""
    # TODO (Person 4): Implement smart recommendations
    return InsightCard(
        type="recommendation",
        title="Boost your score",
        description="Upload a bank or e-wallet statement to add a high-confidence source. This can increase your score significantly.",
        data=None,
    )
