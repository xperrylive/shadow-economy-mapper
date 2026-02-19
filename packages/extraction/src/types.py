"""
Shared types for the extraction pipeline.

These types mirror packages/shared-types/src/models.ts
Keep them in sync!
"""

from typing import TypedDict, Optional, Literal


SourceType = Literal[
    "whatsapp", "telegram", "instagram",
    "csv_grab", "csv_shopee", "csv_foodpanda",
    "pdf_bank", "pdf_ewallet",
    "screenshot", "manual", "voice",
]

Channel = Literal[
    "whatsapp", "grabfood", "shopee", "foodpanda",
    "lazada", "tng", "bank", "cash", "other",
]

EventType = Literal["order", "payment", "payout", "refund"]


class RawExtractedEvent(TypedDict):
    """
    The output contract for all parsers.
    Person 2 (backend) consumes this to create LedgerEntry records.
    """
    timestamp: Optional[str]       # ISO 8601 or None
    amount: Optional[float]        # In MYR, 2 decimal places
    currency: str                  # Default "MYR"
    description: str               # Human-readable description
    channel: Channel
    event_type: Optional[EventType]
    confidence: float              # 0.0 - 1.0
    raw_text: Optional[str]        # Original text for debugging
    metadata: Optional[dict]       # Extra info (order_id, items, fees, etc.)
