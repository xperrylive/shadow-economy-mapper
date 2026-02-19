"""
WhatsApp Chat Export Parser

Parses WhatsApp .txt exports into RawExtractedEvent list.

WhatsApp format (common patterns):
  [1/15/24, 10:30:15 AM] John: 2x nasi lemak RM12
  1/15/24, 10:30 AM - John: paid RM12 tng

Person 3 owns this file.
"""

import re
from typing import Optional
from ..types import RawExtractedEvent

# Common WhatsApp timestamp patterns
TIMESTAMP_PATTERNS = [
    # [MM/DD/YY, HH:MM:SS AM/PM]
    r'\[(\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}(?::\d{2})?\s[AP]M)\]',
    # MM/DD/YY, HH:MM AM/PM -
    r'(\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}(?::\d{2})?\s[AP]M)\s-',
    # DD/MM/YYYY, HH:MM -
    r'(\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2})\s-',
]

# Amount extraction: RM followed by number
AMOUNT_PATTERN = re.compile(r'RM\s?(\d+(?:\.\d{1,2})?)', re.IGNORECASE)

# Payment keywords (Malaysian context)
PAYMENT_KEYWORDS = [
    "paid", "bayar", "transfer", "tng", "bank in",
    "duit masuk", "received", "terima", "settle",
]

# Order keywords
ORDER_KEYWORDS = [
    "order", "tempah", "beli", "nak", "want",
    "kuih", "nasi", "delivery", "cod", "pickup",
]


def parse_whatsapp(file_bytes: bytes, **kwargs) -> list[RawExtractedEvent]:
    """
    Parse a WhatsApp .txt export file into raw events.

    Args:
        file_bytes: Raw bytes of the .txt file

    Returns:
        List of RawExtractedEvent dicts
    """
    text = file_bytes.decode("utf-8", errors="replace")
    messages = _split_messages(text)
    events = []

    for msg in messages:
        timestamp = msg.get("timestamp")
        sender = msg.get("sender", "")
        content = msg.get("content", "")

        # Skip system messages
        if not sender or _is_system_message(content):
            continue

        # Extract amounts
        amounts = AMOUNT_PATTERN.findall(content)
        if not amounts:
            continue

        # Classify intent
        event_type = _classify_intent(content)
        if not event_type:
            continue

        for amount_str in amounts:
            events.append(RawExtractedEvent(
                timestamp=timestamp,
                amount=float(amount_str),
                currency="MYR",
                description=content[:200],
                channel="whatsapp",
                event_type=event_type,
                confidence=_compute_confidence(content, event_type),
                raw_text=content,
                metadata={"sender": sender},
            ))

    return events


def _split_messages(text: str) -> list[dict]:
    """Split raw WhatsApp text into individual messages."""
    # TODO (Person 3): Implement robust multi-pattern message splitting
    # Handle different WhatsApp export formats (Android vs iOS, different locales)
    messages = []

    # Simple line-by-line approach — improve this
    for line in text.split("\n"):
        for pattern in TIMESTAMP_PATTERNS:
            match = re.match(pattern, line)
            if match:
                timestamp_str = match.group(1)
                remainder = line[match.end():].strip(" :-]")
                parts = remainder.split(":", 1)
                if len(parts) == 2:
                    messages.append({
                        "timestamp": timestamp_str,  # TODO: parse to ISO 8601
                        "sender": parts[0].strip(),
                        "content": parts[1].strip(),
                    })
                break

    return messages


def _classify_intent(text: str) -> Optional[str]:
    """Classify a message as order, payment, or None."""
    text_lower = text.lower()

    if any(kw in text_lower for kw in PAYMENT_KEYWORDS):
        return "payment"
    if any(kw in text_lower for kw in ORDER_KEYWORDS):
        return "order"

    return None


def _is_system_message(content: str) -> bool:
    """Check if message is a WhatsApp system message."""
    system_indicators = [
        "messages and calls are end-to-end encrypted",
        "created group",
        "added you",
        "changed the subject",
        "left",
    ]
    return any(ind in content.lower() for ind in system_indicators)


def _compute_confidence(content: str, event_type: str) -> float:
    """Compute confidence score for this extraction."""
    score = 0.3  # Base confidence for chat-extracted data

    # Boost if amount is clearly stated
    if AMOUNT_PATTERN.search(content):
        score += 0.2

    # Boost if multiple keywords match
    text_lower = content.lower()
    keyword_hits = sum(1 for kw in PAYMENT_KEYWORDS + ORDER_KEYWORDS if kw in text_lower)
    score += min(keyword_hits * 0.1, 0.3)

    return min(score, 1.0)
