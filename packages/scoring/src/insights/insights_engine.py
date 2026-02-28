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


# Channels considered "high confidence" (structured data sources)
_HIGH_CONFIDENCE_CHANNELS = {"bank", "tng", "grabfood", "shopee", "foodpanda", "lazada"}
# Channels that are low confidence on their own
_LOW_CONFIDENCE_CHANNELS = {"whatsapp", "telegram", "instagram", "manual", "other"}


def _suggest_improvements(entries: list[LedgerEntryInput]) -> InsightCard | None:
    """Suggest the single most impactful action the user can take to improve their score."""
    channels = set(e["channel"] for e in entries)
    high_conf_channels = channels & _HIGH_CONFIDENCE_CHANNELS
    low_conf_channels = channels & _LOW_CONFIDENCE_CHANNELS

    # Check recency — is the most recent entry older than 30 days?
    times = [datetime.fromisoformat(e["event_time"].replace("Z", "+00:00")) for e in entries]
    most_recent = max(times)
    days_since_last = (datetime.now(tz=most_recent.tzinfo) - most_recent).days
    stale = days_since_last > 30

    avg_confidence = sum(e["confidence"] for e in entries) / len(entries)

    # Priority 1: No high-confidence sources at all
    if not high_conf_channels:
        return InsightCard(
            type="recommendation",
            title="Add a bank or e-wallet statement",
            description=(
                "Your evidence is currently from chat or manual entries only. "
                "Uploading a Maybank, CIMB, or TNG e-wallet statement adds a "
                "high-confidence source and can boost your score by 15–20 points."
            ),
            data={"missing": "high_confidence_source"},
        )

    # Priority 2: Only one channel total
    if len(channels) == 1:
        channel = next(iter(channels))
        return InsightCard(
            type="recommendation",
            title="Add a second evidence source",
            description=(
                f"You only have evidence from {channel}. "
                "Adding a second source (e.g. WhatsApp chat + TNG statement) "
                "enables cross-verification and can add up to 15 points."
            ),
            data={"current_channels": list(channels)},
        )

    # Priority 3: Data is stale
    if stale:
        return InsightCard(
            type="recommendation",
            title="Your evidence is out of date",
            description=(
                f"Your most recent entry is {days_since_last} days old. "
                "Upload recent activity to show your business is still operating — "
                "lenders want to see current income, not just historical data."
            ),
            data={"days_since_last_entry": days_since_last},
        )

    # Priority 4: Low average confidence (mostly screenshots/chat, no CSVs)
    if avg_confidence < 0.6 and not any(
        c in high_conf_channels for c in ("bank", "tng")
    ):
        return InsightCard(
            type="recommendation",
            title="Replace screenshots with CSV exports",
            description=(
                "Most of your evidence is from screenshots or chats, which have lower confidence. "
                "Download a CSV export directly from GrabFood, Shopee, or your e-wallet app "
                "for a more reliable data source."
            ),
            data={"avg_confidence": round(avg_confidence, 2)},
        )

    # Priority 5: Only chat/manual, no platform data
    if low_conf_channels and not high_conf_channels - {"bank", "tng"}:
        return InsightCard(
            type="recommendation",
            title="Add your delivery platform data",
            description=(
                "You have bank/e-wallet data but no platform exports. "
                "Adding a GrabFood or Shopee CSV export links your orders "
                "to your payment records and strengthens cross-source verification."
            ),
            data={"suggestion": "platform_csv"},
        )

    # All good
    return InsightCard(
        type="recommendation",
        title="Strong evidence coverage",
        description=(
            f"You have {len(channels)} evidence sources covering both platform and payment data. "
            "Keep uploading regularly to maintain a current and credible financial record."
        ),
        data={"channel_count": len(channels)},
    )
