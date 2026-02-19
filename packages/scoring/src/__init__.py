"""
Shadow Economy Mapper — Scoring & Insights Engine

Person 4 owns this package.

Main entry points:
  compute_score(entries) -> CredibilityScore
  generate_insights(entries) -> list[InsightCard]

The backend (Person 2) calls these functions.
All functions are PURE — they receive data and return results, no DB calls.
"""

from .types import CredibilityScore, InsightCard, LedgerEntryInput
from .credibility.score_engine import compute_score
from .insights.insights_engine import generate_insights

__all__ = ["compute_score", "generate_insights"]
