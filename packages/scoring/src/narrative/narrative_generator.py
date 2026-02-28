"""
Narrative Generator — LLM-written report summary for verifiers.

Generates a 2-paragraph professional narrative from the computed score data.
Uses Gemini Flash. Fails silently — narrative is optional, never blocks scoring.

Person 4 owns this file.
"""

import logging
import os
from datetime import datetime

from ..types import CredibilityScore, LedgerEntryInput

logger = logging.getLogger(__name__)

_BREAKDOWN_LABELS = {
    "activity": "transaction activity",
    "consistency": "revenue consistency",
    "longevity": "business longevity",
    "evidence_strength": "evidence quality",
    "cross_source": "cross-source verification",
}

_FLAG_DESCRIPTIONS = {
    "spike_detected": "an unusual revenue spike was detected",
    "round_numbers_suspicious": "a high proportion of round-number amounts was detected",
    "uniform_intervals": "suspiciously uniform transaction intervals were detected",
    "missing_period": "a gap in activity was detected",
    "duplicate_upload": "possible duplicate data was detected",
}


def generate_narrative(score: CredibilityScore, entries: list[LedgerEntryInput]) -> str:
    """
    Generate a 2-paragraph professional narrative for a bank/NGO verifier.

    Args:
        score: The computed CredibilityScore (TypedDict).
        entries: The ledger entries used to compute the score.

    Returns:
        A narrative string (2 paragraphs). Returns "" on any failure.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        logger.warning("GEMINI_API_KEY not set — skipping narrative generation")
        return ""

    prompt = _build_prompt(score, entries)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=400,
                temperature=0.4,
            ),
        )
        return (response.text or "").strip()
    except Exception as exc:
        logger.warning("Narrative generation failed: %s", exc)
        return ""


def _build_prompt(score: CredibilityScore, entries: list[LedgerEntryInput]) -> str:
    """Build a compact prompt from score data and entry summary stats."""
    # Summary stats from entries
    if entries:
        times = [
            datetime.fromisoformat(e["event_time"].replace("Z", "+00:00"))
            for e in entries
        ]
        start_date = min(times).strftime("%B %Y")
        end_date = max(times).strftime("%B %Y")
        total_revenue = sum(e["amount"] for e in entries)
        n_transactions = len(entries)
        channels = sorted(set(e["channel"] for e in entries))
    else:
        start_date = end_date = "unknown"
        total_revenue = 0.0
        n_transactions = 0
        channels = []

    # Score breakdown
    breakdown = score.get("breakdown") or {}
    breakdown_lines = []
    for key, label in _BREAKDOWN_LABELS.items():
        val = breakdown.get(key)
        if val is not None:
            breakdown_lines.append(f"  - {label}: {float(val):.1f} pts")

    # Flags
    flags = score.get("flags") or []
    flag_lines = [
        f"  - {_FLAG_DESCRIPTIONS.get(f, f.replace('_', ' '))}"
        for f in flags
    ]

    prompt = f"""You are writing a financial credibility report for a Malaysian micro-business applying for a loan or government aid.

The report is addressed to a bank officer or NGO verifier. Write exactly 2 short paragraphs:
- Paragraph 1: Summarise the business's financial activity (when active, how many transactions, total revenue, which platforms/channels).
- Paragraph 2: Explain what the credibility score means, what is strong, and note any flags. End with a clear overall assessment.

Use plain professional English. Be factual. Do not use bullet points. Maximum 120 words total.

--- DATA ---
Credibility Score: {score.get("score", 0)} / 100
Confidence Level: {score.get("confidence_level", "LOW")}
Active Period: {start_date} to {end_date}
Total Transactions: {n_transactions}
Total Revenue: RM {total_revenue:,.2f}
Evidence Channels: {", ".join(channels) if channels else "none"}

Score Breakdown:
{chr(10).join(breakdown_lines) if breakdown_lines else "  - not available"}

Data Quality Flags:
{chr(10).join(flag_lines) if flag_lines else "  - none"}
--- END DATA ---

Write the 2-paragraph narrative now:"""

    return prompt
