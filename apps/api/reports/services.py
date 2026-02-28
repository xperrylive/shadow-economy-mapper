"""
Reports service: generate PDF → upload to Supabase Storage → save Report record.

Public API:
    process_report_generate(business, report_type) -> Report

Raises ValueError when no CredibilityScore exists yet for the business.
"""

import io
import logging
from datetime import datetime, timezone as dt_timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from core.models import BusinessProfile
from core.storage import upload_report_pdf
from evidence.models import CredibilityScore
from .models import Report

logger = logging.getLogger(__name__)

_CONFIDENCE_COLOR = {"HIGH": "#22c55e", "MEDIUM": "#f59e0b", "LOW": "#ef4444"}
_BREAKDOWN_LABELS = {
    "activity": "Activity",
    "consistency": "Consistency",
    "longevity": "Longevity",
    "evidence_strength": "Evidence Strength",
    "evidenceStrength": "Evidence Strength",
    "cross_source": "Cross-Source Corroboration",
    "crossSource": "Cross-Source Corroboration",
    "penalties": "Penalties",
}


def process_report_generate(business: BusinessProfile, report_type: str) -> Report:
    """
    Generate a PDF report for a business, upload it, and save the Report record.

    Fetches the latest CredibilityScore; raises ValueError when none exists.

    Args:
        business: The BusinessProfile to report on.
        report_type: "sme" or "verifier".

    Returns:
        The created Report instance (pdf_url populated).

    Raises:
        ValueError: No CredibilityScore exists yet — run /scores/compute/ first.
    """
    try:
        score = CredibilityScore.objects.filter(business=business).latest()
    except CredibilityScore.DoesNotExist:
        raise ValueError(
            f"No score computed for business {business.id}. "
            "Call /api/evidence/scores/compute/ first."
        )

    pdf_bytes = _build_pdf(business, score, report_type)

    # Create record first to get its UUID for the storage path.
    report = Report.objects.create(
        business=business,
        report_type=report_type,
        pdf_url="",
        data_snapshot={
            "score": score.score,
            "confidence_level": score.confidence_level,
            "breakdown": score.breakdown,
            "flags": score.flags,
            "insights": score.insights,
            "computed_at": score.computed_at.isoformat(),
        },
    )

    pdf_url = upload_report_pdf(pdf_bytes, str(business.id), str(report.id))
    report.pdf_url = pdf_url
    report.save(update_fields=["pdf_url"])
    logger.info("Report %s generated for business %s.", report.id, business.id)
    return report


# ---------------------------------------------------------------------------
# PDF builder
# ---------------------------------------------------------------------------


def _build_pdf(business: BusinessProfile, score: CredibilityScore, report_type: str) -> bytes:
    """Render the report as PDF bytes using reportlab PLATYPUS."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
        title=f"Financial Activity Report — {business.name}",
        author="Shadow Economy Mapper",
    )
    base = getSampleStyleSheet()
    story = _build_story(business, score, report_type, base)
    doc.build(story)
    return buffer.getvalue()


def _build_story(business, score, report_type, base) -> list:
    label_s = ParagraphStyle("lbl", parent=base["Normal"], fontSize=9, textColor=colors.HexColor("#888888"))
    title_s = ParagraphStyle("ttl", parent=base["Heading1"], fontSize=20, spaceAfter=4, textColor=colors.HexColor("#1a1a2e"))
    sub_s = ParagraphStyle("sub", parent=base["Normal"], fontSize=11, spaceAfter=2, textColor=colors.HexColor("#444444"))
    section_s = ParagraphStyle("sec", parent=base["Heading2"], fontSize=13, spaceBefore=14, spaceAfter=6, textColor=colors.HexColor("#1a1a2e"))
    body_s = ParagraphStyle("bod", parent=base["Normal"], fontSize=10, leading=14, textColor=colors.HexColor("#333333"))
    foot_s = ParagraphStyle("ftr", parent=base["Normal"], fontSize=8, textColor=colors.HexColor("#aaaaaa"), alignment=1)

    report_label = "SME Income Report" if report_type == "sme" else "Verifier Report"
    generated = datetime.now(dt_timezone.utc).strftime("%d %B %Y, %H:%M UTC")
    divider = HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#dddddd"), spaceAfter=10)

    story = [
        Paragraph("Shadow Economy Mapper", label_s),
        Paragraph(report_label, title_s),
        Paragraph(business.name, sub_s),
    ]
    if business.location:
        story.append(Paragraph(business.location, label_s))
    story += [Paragraph(f"Generated: {generated}", label_s), divider]

    # Score block
    conf_color = _CONFIDENCE_COLOR.get(score.confidence_level, "#888888")
    story.append(Paragraph("Credibility Score", section_s))
    score_tbl = Table([[
        Paragraph(f'<font size="36" color="#1a1a2e"><b>{score.score}</b></font>', base["Normal"]),
        Paragraph(
            f'<font size="13" color="{conf_color}"><b>{score.confidence_level} CONFIDENCE</b></font><br/>'
            f'<font size="9" color="#888888">Computed: {score.computed_at.strftime("%d %b %Y")}</font>',
            base["Normal"],
        ),
    ]], colWidths=[4 * cm, None])
    score_tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(score_tbl)

    # Narrative (LLM-generated summary) — shown before breakdown
    breakdown = score.breakdown or {}
    narrative = breakdown.get("narrative", "")
    if narrative:
        story.append(Paragraph("Summary", section_s))
        story.append(Paragraph(narrative, body_s))

    # Breakdown table
    if breakdown:
        story.append(Paragraph("Score Breakdown", section_s))
        rows = [["Component", "Points"]]
        seen: set = set()
        for key, val in breakdown.items():
            if key == "narrative":
                continue  # skip the narrative string from the table
            display = _BREAKDOWN_LABELS.get(key, key.replace("_", " ").title())
            if display in seen:
                continue
            seen.add(display)
            fmt = f"{float(val):+.1f}" if key == "penalties" else f"{float(val):.1f}"
            rows.append([display, fmt])
        bd_tbl = Table(rows, colWidths=[None, 3 * cm])
        bd_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f5")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddddd")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafafa")]),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ]))
        story.append(bd_tbl)

    # Flags
    if score.flags:
        story.append(Paragraph("Flags", section_s))
        for flag in score.flags:
            story.append(Paragraph(f"• {str(flag).replace('_', ' ').title()}", body_s))

    # Insights
    insights = score.insights or []
    if insights:
        story.append(Paragraph("Insights & Recommendations", section_s))
        for insight in insights:
            title = insight.get("title", "") if isinstance(insight, dict) else getattr(insight, "title", "")
            desc = insight.get("description", "") if isinstance(insight, dict) else getattr(insight, "description", "")
            if title:
                story.append(Paragraph(f"<b>{title}</b>", body_s))
            if desc:
                story.append(Paragraph(desc, body_s))
            story.append(Spacer(1, 5))

    # Footer
    story += [
        Spacer(1, 20), divider,
        Paragraph(
            "This report was generated by Shadow Economy Mapper. "
            "It is not a substitute for professional financial advice.",
            foot_s,
        ),
    ]
    return story
