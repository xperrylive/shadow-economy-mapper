"""
Cross-Source Linking Engine.

Matches events across channels and computes cross-source confirmation score.

Person 4 owns this file.
"""

from ..types import LedgerEntryInput


def compute_cross_source_score(entries: list[LedgerEntryInput]) -> float:
    """
    Compute score based on cross-source confirmations. Max 15.

    Higher score if multiple sources confirm the same transactions.
    E.g., WhatsApp "paid RM24" matching TNG statement entry of RM24.
    """
    # TODO (Person 4): Implement cross-source matching
    #
    # Approach:
    # 1. Group entries by date bucket (same day)
    # 2. Within each bucket, compare entries from different channels
    # 3. Score similarity (amount proximity, time proximity)
    # 4. Count confirmed matches
    #
    # Example match:
    #   Entry A: WhatsApp, RM24, 10:35 AM, "payment"
    #   Entry B: TNG statement, RM24, 10:36 AM, "payout"
    #   → High similarity → confirmed cross-source match

    channels = set(e["channel"] for e in entries)
    if len(channels) <= 1:
        return 2.0  # Single source = minimal cross-source score

    # Placeholder: give points for having multiple sources
    return min(len(channels) * 3.0, 15.0)


def find_event_links(entries: list[LedgerEntryInput]) -> list[dict]:
    """
    Find links between entries across different sources.

    Returns list of link dicts: {entry_a_id, entry_b_id, link_type, score}
    """
    # TODO (Person 4): Implement pairwise matching
    return []
