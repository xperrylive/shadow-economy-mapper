"""
Screenshot/Image OCR Parser.

Person 3 owns this file.
"""

from ..types import RawExtractedEvent


def parse_screenshot(file_bytes: bytes, source_type: str = "screenshot", **kwargs) -> list[RawExtractedEvent]:
    """
    Extract transaction data from screenshots using OCR.

    Args:
        file_bytes: Raw image bytes (PNG/JPG)
        source_type: "screenshot"

    Returns:
        List of RawExtractedEvent dicts
    """
    # TODO (Person 3): Implement OCR pipeline
    #
    # Recommended approach:
    # 1. Preprocess with Pillow: contrast, deskew, sharpen
    # 2. Run OCR: Tesseract.js (local) or Google Cloud Vision (production)
    # 3. Parse OCR text for amounts, dates, order counts
    # 4. Template matching for known platforms (GrabFood, Shopee screenshots)
    #
    # Example with pytesseract:
    #   from PIL import Image, ImageEnhance
    #   import pytesseract
    #   import io
    #
    #   img = Image.open(io.BytesIO(file_bytes))
    #   img = ImageEnhance.Contrast(img).enhance(2.0)
    #   text = pytesseract.image_to_string(img)
    #   # Then parse text for amounts and dates
    #
    # For Google Cloud Vision:
    #   from google.cloud import vision
    #   client = vision.ImageAnnotatorClient()
    #   response = client.text_detection(image=vision.Image(content=file_bytes))

    return []
