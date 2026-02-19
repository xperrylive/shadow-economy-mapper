"""
CSV Parser — GrabFood, Shopee, Foodpanda exports.

Person 3 owns this file.
"""

import csv
import io
from ..types import RawExtractedEvent


# Known CSV schemas for Malaysian platforms
KNOWN_SCHEMAS = {
    "csv_grab": {
        "date_cols": ["Order Date", "Date", "Created"],
        "amount_cols": ["Total", "Amount", "Net Amount", "Subtotal"],
        "status_cols": ["Status", "Order Status"],
    },
    "csv_shopee": {
        "date_cols": ["Order Creation Date", "Ship Time"],
        "amount_cols": ["Order Total Amount", "Product Subtotal"],
        "status_cols": ["Order Status"],
    },
    "csv_foodpanda": {
        "date_cols": ["Date", "Order Date"],
        "amount_cols": ["Total", "Net", "Amount"],
        "status_cols": ["Status"],
    },
}


def parse_csv(file_bytes: bytes, source_type: str = "csv_grab", **kwargs) -> list[RawExtractedEvent]:
    """
    Parse a platform CSV export into raw events.

    Args:
        file_bytes: Raw CSV file bytes
        source_type: Which platform (csv_grab, csv_shopee, csv_foodpanda)

    Returns:
        List of RawExtractedEvent dicts
    """
    text = file_bytes.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))

    if not reader.fieldnames:
        return []

    schema = KNOWN_SCHEMAS.get(source_type, KNOWN_SCHEMAS["csv_grab"])
    column_map = _detect_columns(reader.fieldnames, schema)

    if not column_map.get("amount"):
        return []

    channel = _source_to_channel(source_type)
    events = []

    for row in reader:
        amount = _parse_amount(row.get(column_map["amount"], ""))
        if amount is None or amount <= 0:
            continue

        events.append(RawExtractedEvent(
            timestamp=row.get(column_map.get("date", ""), None),  # TODO: normalize to ISO
            amount=amount,
            currency="MYR",
            description=f"{source_type} order",
            channel=channel,
            event_type="order",
            confidence=0.9,  # CSV data is high confidence
            raw_text=str(row),
            metadata={k: v for k, v in row.items() if v},
        ))

    return events


def _detect_columns(fieldnames: list[str], schema: dict) -> dict:
    """Auto-detect which columns map to date, amount, status."""
    mapping = {}
    for role, candidates in schema.items():
        key = role.replace("_cols", "")
        for candidate in candidates:
            if candidate in fieldnames:
                mapping[key] = candidate
                break
    return mapping


def _parse_amount(value: str) -> float | None:
    """Parse amount string, handling commas, RM prefix, etc."""
    if not value:
        return None
    cleaned = value.replace(",", "").replace("RM", "").replace("MYR", "").strip()
    try:
        return round(float(cleaned), 2)
    except ValueError:
        return None


def _source_to_channel(source_type: str) -> str:
    return {
        "csv_grab": "grabfood",
        "csv_shopee": "shopee",
        "csv_foodpanda": "foodpanda",
    }.get(source_type, "other")
