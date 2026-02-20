"""
Cross-Source Linking Engine.

Matches events across channels and computes cross-source confirmation score.

Person 4 owns this file.
"""

from datetime import datetime, timedelta

from ..types import LedgerEntryInput

# Time windows (seconds) for candidate generation
_PAYMENT_WINDOW = 10 * 60       # 10 min — payments, payouts, refunds
_ORDER_WINDOW = 2 * 60 * 60     # 2 hr  — orders (platform delay expected)
_SCAN_WINDOW = timedelta(seconds=_ORDER_WINDOW)  # widest window; used to break the inner loop

_MATCH_THRESHOLD = 0.50         # minimum score to emit a link
_HIGH_CONF_THRESHOLD = 0.80     # score that counts as "confirmed"


def compute_cross_source_score(entries: list[LedgerEntryInput]) -> float:
    """
    Compute score based on cross-source confirmations. Max 15.

    Higher score if multiple sources confirm the same transactions.
    E.g., WhatsApp "paid RM24" matching TNG statement entry of RM24.
    """
    channels = set(e["channel"] for e in entries)
    if len(channels) <= 1:
        return 2.0  # Single source — no cross-verification possible

    links = find_event_links(entries)
    confirmed = sum(1 for lnk in links if lnk["score"] >= _HIGH_CONF_THRESHOLD)
    probable = sum(1 for lnk in links if _MATCH_THRESHOLD <= lnk["score"] < _HIGH_CONF_THRESHOLD)
    return min(2.0 + confirmed * 3.0 + probable * 1.0, 15.0)


def find_event_links(entries: list[LedgerEntryInput]) -> list[dict]:
    """
    Find links between entries across different sources.

    Returns list of link dicts: {entry_a_id, entry_b_id, link_type, score}
    """
    if len(entries) < 2:
        return []

    # Sort once by time — enables the forward-scan early-exit below
    parsed: list[tuple[datetime, LedgerEntryInput]] = []
    for e in entries:
        dt = datetime.fromisoformat(e["event_time"].replace("Z", "+00:00"))
        parsed.append((dt, e))
    parsed.sort(key=lambda x: x[0])

    links: list[dict] = []

    for i, (time_a, entry_a) in enumerate(parsed):
        for j in range(i + 1, len(parsed)):
            time_b, entry_b = parsed[j]

            # Early exit: nothing further in the list can be within any window
            if time_b - time_a > _SCAN_WINDOW:
                break

            # Only link entries from different channels
            if entry_a["channel"] == entry_b["channel"]:
                continue

            # Choose window by event types (if either is an order, use wider window)
            window = (
                _ORDER_WINDOW
                if "order" in (entry_a["event_type"], entry_b["event_type"])
                else _PAYMENT_WINDOW
            )
            delta_sec = (time_b - time_a).total_seconds()
            if delta_sec > window:
                continue

            score = _similarity_score(entry_a, entry_b, delta_sec, window)
            if score < _MATCH_THRESHOLD:
                continue

            links.append({
                "entry_a_id": entry_a["id"],
                "entry_b_id": entry_b["id"],
                "link_type": "confirmed" if score >= _HIGH_CONF_THRESHOLD else "probable",
                "score": round(score, 3),
            })

    # Stable order: score desc, then entry_a_id asc
    links.sort(key=lambda lnk: (-lnk["score"], lnk["entry_a_id"]))
    return links


# ─── Private helpers ─────────────────────────────────────────────────────────

def _similarity_score(
    entry_a: LedgerEntryInput,
    entry_b: LedgerEntryInput,
    delta_sec: float,
    window_sec: int,
) -> float:
    """Combine amount and time similarity. Returns 0.0–1.0."""
    amount_score = _amount_similarity(entry_a["amount"], entry_b["amount"])
    if amount_score == 0.0:
        return 0.0  # No amount match — skip the rest
    time_score = max(0.0, 1.0 - delta_sec / window_sec)
    return 0.6 * amount_score + 0.4 * time_score


def _amount_similarity(a: float, b: float) -> float:
    """
    Tiered amount match.

      Exact         → 1.00
      Within RM0.50 → 0.85  (rounding / fee differences)
      Within 2%     → 0.60  (platform cuts, service charges)
      Otherwise     → 0.00
    """
    if a == b:
        return 1.0
    diff = abs(a - b)
    if diff <= 0.50:
        return 0.85
    larger = max(abs(a), abs(b))
    if larger > 0 and diff / larger <= 0.02:
        return 0.60
    return 0.0
