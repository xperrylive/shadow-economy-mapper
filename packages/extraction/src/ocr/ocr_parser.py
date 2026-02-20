"""
Screenshot/Image OCR Parser.

Two-stage pipeline:
  Stage 1: PaddleOCR-VL-1.5 API → raw text with layout understanding
  Stage 2: Gemini 3 Flash API  → structured transaction extraction

If PaddleOCR is not configured or fails, Gemini receives the image directly
(multimodal fallback).

Person 3 owns this file.
"""

import base64
import json
import logging
import os
import re
from typing import Optional

import requests

from ..types import RawExtractedEvent

logger = logging.getLogger(__name__)


# ── Malaysian platform keywords for channel detection ──────────────────────

CHANNEL_KEYWORDS = {
    "grabfood": ["grab", "grabfood", "grab food"],
    "shopee": ["shopee", "shopee food", "shopeefood", "shopeepay"],
    "foodpanda": ["foodpanda", "food panda", "pandapay"],
    "tng": ["touch 'n go", "touch n go", "tng", "tng ewallet", "tng e-wallet"],
    "bank": [
        "maybank", "cimb", "rhb", "public bank", "hong leong",
        "ambank", "bank islam", "bank rakyat", "bsn", "affin",
        "ocbc", "uob", "hsbc", "standard chartered",
    ],
    "lazada": ["lazada"],
}


GEMINI_EXTRACTION_PROMPT = """\
You are a financial data extraction assistant for Malaysian small businesses.

Analyze the provided image (a screenshot of a transaction, receipt, e-wallet,
food delivery app, or bank statement). Extract ALL visible transactions.

For each transaction, return a JSON object with these fields:
- "timestamp": ISO 8601 string (e.g. "2024-07-15T10:30:00") or null
- "amount": number in MYR (e.g. 45.50), positive for income/sales, or null
- "currency": always "MYR" unless another currency is clearly shown
- "description": short human-readable summary of the transaction
- "platform": the app or service name visible (e.g. "GrabFood", "Shopee", "TNG", "Maybank")
- "event_type": one of "order", "payment", "payout", "refund" — or null if unclear
- "order_id": order/reference number if visible, or null
- "items": list of item names if visible, or null

Return ONLY a JSON array. No markdown fences, no explanation.
Example: [{"timestamp": "2024-07-15T10:30:00", "amount": 25.00, ...}]
If no transactions are found, return: []
"""


# ── Stage 1: PaddleOCR-VL-1.5 ─────────────────────────────────────────────


def _call_paddleocr(file_bytes: bytes) -> Optional[str]:
    """
    Call PaddleOCR-VL-1.5 API to extract text from an image.

    Returns markdown-formatted OCR text, or None if unavailable/failed.
    """
    api_url = os.environ.get("PADDLEOCR_API_URL", "").strip()
    api_key = os.environ.get("PADDLEOCR_API_KEY", "").strip()

    if not api_url or not api_key:
        logger.info("PaddleOCR not configured (missing URL or KEY), skipping Stage 1")
        return None

    # If URL already ends with /layout-parsing, use as-is; otherwise append it
    url = api_url if api_url.rstrip("/").endswith("/layout-parsing") else f"{api_url.rstrip('/')}/layout-parsing"
    headers = {
        "Authorization": f"token {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "file": base64.b64encode(file_bytes).decode("ascii"),
        "fileType": 1,
        "useDocOrientationClassify": True,
        "useDocUnwarping": True,
        "useChartRecognition": False,
    }

    resp = requests.post(url, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    body = resp.json()

    if body.get("errorCode") != 0:
        logger.warning("PaddleOCR returned error: %s", body.get("errorMsg"))
        return None

    pages = body.get("result", {}).get("layoutParsingResults", [])
    if not pages:
        return None

    texts = [p["markdown"]["text"] for p in pages if p.get("markdown", {}).get("text")]
    return "\n".join(texts) if texts else None


# ── Stage 2: Gemini 3 Flash ────────────────────────────────────────────────


def _call_gemini(file_bytes: bytes, ocr_text: Optional[str] = None) -> list[dict]:
    """
    Use Gemini 3 Flash to extract structured transaction data.

    Sends the image directly (multimodal) plus OCR text if available.
    Returns a list of raw transaction dicts parsed from JSON.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    # Build prompt parts
    prompt_text = GEMINI_EXTRACTION_PROMPT
    if ocr_text:
        prompt_text += (
            "\n\nBelow is OCR-extracted text from the same image "
            "(use it to cross-verify your reading):\n"
            "--- OCR TEXT START ---\n"
            f"{ocr_text}\n"
            "--- OCR TEXT END ---"
        )

    mime = _guess_mime(file_bytes)

    parts = [
        types.Part(text=prompt_text),
        types.Part(inline_data=types.Blob(mime_type=mime, data=file_bytes)),
    ]

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=[types.Content(parts=parts)],
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="low"),
        ),
    )

    return _parse_json_response(response.text)


def _guess_mime(file_bytes: bytes) -> str:
    """Guess MIME type from magic bytes."""
    if file_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if file_bytes[:2] == b"\xff\xd8":
        return "image/jpeg"
    if file_bytes[:4] == b"RIFF" and file_bytes[8:12] == b"WEBP":
        return "image/webp"
    return "image/png"  # safe default


def _parse_json_response(text: str) -> list[dict]:
    """Extract a JSON array from Gemini's response text."""
    if not text:
        return []

    # Strip markdown code fences if present
    cleaned = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`")

    # Find the JSON array
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start == -1 or end == -1 or end <= start:
        logger.warning("No JSON array found in Gemini response: %s", text[:200])
        return []

    try:
        return json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError as e:
        logger.warning("Failed to parse Gemini JSON: %s — response: %s", e, text[:300])
        return []


# ── Channel detection & confidence ─────────────────────────────────────────


def _detect_channel(platform: str, ocr_text: str) -> str:
    """Map platform name / OCR text to a Channel value."""
    combined = f"{platform} {ocr_text}".lower()
    for channel, keywords in CHANNEL_KEYWORDS.items():
        if any(kw in combined for kw in keywords):
            return channel
    return "other"


def _compute_confidence(item: dict, had_ocr: bool) -> float:
    """
    Compute a confidence score for an extracted event.

    Base: 0.45 (image-only) or 0.55 (with PaddleOCR cross-verification)
    Boosts: clear amount (+0.15), clear timestamp (+0.10), known platform (+0.10)
    """
    score = 0.55 if had_ocr else 0.45

    if item.get("amount") is not None:
        score += 0.15
    if item.get("timestamp"):
        score += 0.10
    if item.get("platform"):
        score += 0.10

    return min(round(score, 2), 1.0)


# ── Public entry point ─────────────────────────────────────────────────────


def parse_screenshot(
    file_bytes: bytes, source_type: str = "screenshot", **kwargs
) -> list[RawExtractedEvent]:
    """
    Extract transaction data from screenshots using a two-stage OCR pipeline.

    Stage 1 (optional): PaddleOCR-VL-1.5 for high-quality text extraction.
    Stage 2 (required): Gemini 3 Flash for structured data extraction.

    Args:
        file_bytes: Raw image bytes (PNG/JPG/WEBP)
        source_type: "screenshot"

    Returns:
        List of RawExtractedEvent dicts
    """
    if not file_bytes:
        return []

    # ── Stage 1: PaddleOCR ──
    ocr_text: Optional[str] = None
    try:
        ocr_text = _call_paddleocr(file_bytes)
        if ocr_text:
            logger.info("PaddleOCR extracted %d chars", len(ocr_text))
    except Exception as exc:
        logger.warning("PaddleOCR failed, falling back to Gemini only: %s", exc)

    # ── Stage 2: Gemini ──
    try:
        raw_items = _call_gemini(file_bytes, ocr_text)
    except Exception as exc:
        logger.error("Gemini extraction failed: %s", exc)
        return []

    if not raw_items:
        return []

    # ── Convert to RawExtractedEvent ──
    events: list[RawExtractedEvent] = []
    for item in raw_items:
        platform = item.get("platform", "")
        channel = _detect_channel(platform, ocr_text or "")

        amount = item.get("amount")
        if amount is not None:
            try:
                amount = round(float(amount), 2)
            except (ValueError, TypeError):
                amount = None

        events.append(
            RawExtractedEvent(
                timestamp=item.get("timestamp"),
                amount=amount,
                currency=item.get("currency", "MYR"),
                description=item.get("description", "Screenshot transaction"),
                channel=channel,
                event_type=item.get("event_type"),
                confidence=_compute_confidence(item, ocr_text is not None),
                raw_text=ocr_text,
                metadata={
                    k: v
                    for k, v in {
                        "platform": platform,
                        "order_id": item.get("order_id"),
                        "items": item.get("items"),
                        "source": "ocr_pipeline",
                        "had_paddleocr": ocr_text is not None,
                    }.items()
                    if v is not None
                },
            )
        )

    return events
