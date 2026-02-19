"""
Shared types for the scoring engine.

These mirror packages/shared-types/src/models.ts — keep in sync!
"""

from typing import TypedDict, Optional, Literal


class LedgerEntryInput(TypedDict):
    """Input from backend — matches the LedgerEntry model."""
    id: str
    business_id: str
    event_time: str          # ISO 8601
    amount: float
    currency: str
    channel: str
    event_type: str
    source_evidence_id: str
    confidence: float        # 0.0 - 1.0
    attributes: dict


class ScoreBreakdown(TypedDict):
    activity: float          # 0-30
    consistency: float       # 0-20
    longevity: float         # 0-20
    evidence_strength: float # 0-25
    cross_source: float      # 0-15
    penalties: float         # -20 to 0


class CredibilityScore(TypedDict):
    score: int                                       # 0-100
    confidence_level: Literal["LOW", "MEDIUM", "HIGH"]
    breakdown: ScoreBreakdown
    flags: list[str]


class InsightCard(TypedDict):
    type: Literal["peak_day", "trend", "recommendation", "coverage"]
    title: str
    description: str
    data: Optional[dict]
