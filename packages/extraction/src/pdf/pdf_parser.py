"""
PDF Parser — Bank statements, e-wallet exports, platform payouts.

Person 3 owns this file.
"""

from ..types import RawExtractedEvent


def parse_pdf(file_bytes: bytes, source_type: str = "pdf_bank", **kwargs) -> list[RawExtractedEvent]:
    """
    Parse a PDF statement into raw events.

    Uses pdfplumber for table extraction, falls back to text extraction.

    Args:
        file_bytes: Raw PDF bytes
        source_type: pdf_bank or pdf_ewallet

    Returns:
        List of RawExtractedEvent dicts
    """
    # TODO (Person 3): Implement PDF parsing
    #
    # Recommended approach:
    # 1. Try pdfplumber.open() for table extraction
    # 2. If no tables found, use page.extract_text() for line parsing
    # 3. For scanned PDFs, convert pages to images and use OCR path
    #
    # Example with pdfplumber:
    #   import pdfplumber
    #   import io
    #
    #   with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
    #       for page in pdf.pages:
    #           tables = page.extract_tables()
    #           if tables:
    #               for table in tables:
    #                   # Process table rows
    #                   pass
    #           else:
    #               text = page.extract_text()
    #               # Parse text lines for transactions
    #
    # Key challenges:
    # - Different bank statement formats (Maybank, CIMB, RHB, etc.)
    # - TNG e-wallet statement layout
    # - Handling multi-page statements
    # - Missing year in date fields

    return []
