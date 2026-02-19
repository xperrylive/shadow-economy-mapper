"""
Shadow Economy Mapper — Extraction Pipeline

Person 3 owns this package.

Main entry point: extract_evidence(file_bytes, source_type) -> list[RawExtractedEvent]
The backend (Person 2) calls this function.
"""

from .types import RawExtractedEvent, SourceType


def extract_evidence(file_bytes: bytes, source_type: str, **kwargs) -> list[RawExtractedEvent]:
    """
    Main extraction entry point.

    Routes to the appropriate parser based on source_type,
    returns a list of normalized raw events.

    Args:
        file_bytes: Raw file content
        source_type: One of SourceType values
        **kwargs: Additional context (e.g., timezone, language)

    Returns:
        List of RawExtractedEvent dicts
    """
    from .chat.whatsapp_parser import parse_whatsapp
    from .csv.csv_parser import parse_csv
    from .pdf.pdf_parser import parse_pdf
    from .ocr.ocr_parser import parse_screenshot
    from .voice.voice_parser import parse_voice

    parsers = {
        "whatsapp": parse_whatsapp,
        "telegram": lambda b, **kw: [],  # TODO: Implement
        "instagram": lambda b, **kw: [],  # TODO: Implement
        "csv_grab": parse_csv,
        "csv_shopee": parse_csv,
        "csv_foodpanda": parse_csv,
        "pdf_bank": parse_pdf,
        "pdf_ewallet": parse_pdf,
        "screenshot": parse_screenshot,
        "voice": parse_voice,
    }

    parser = parsers.get(source_type)
    if not parser:
        raise ValueError(f"Unknown source type: {source_type}")

    return parser(file_bytes, source_type=source_type, **kwargs)
