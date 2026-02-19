"""
Insights Engine — actionable, not financial advice.

Person 4 owns this file.
"""

from ..types import InsightCard, LedgerEntryInput


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
    # TODO (Person 4): Implement
    # Group by day of week, find highest average
    return InsightCard(
        type="peak_day",
        title="Peak activity days",
        description="Your busiest days appear to be weekends. Consider preparing extra inventory.",
        data=None,
    )


def _detect_trend(entries: list[LedgerEntryInput]) -> InsightCard | None:
    """Detect growth or decline trends in weekly totals."""
    # TODO (Person 4): Implement
    return None


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
