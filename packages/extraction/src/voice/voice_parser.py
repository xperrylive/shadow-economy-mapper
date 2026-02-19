"""
Voice Entry Parser — Speech to structured daily totals.

Person 3 owns this file.
"""

from ..types import RawExtractedEvent


def parse_voice(file_bytes: bytes, source_type: str = "voice", **kwargs) -> list[RawExtractedEvent]:
    """
    Parse voice audio into structured daily total entries.

    Expected usage: "Today total RM120, 8 orders"

    Args:
        file_bytes: Raw audio bytes (WAV/MP3/M4A)

    Returns:
        List of RawExtractedEvent dicts
    """
    # TODO (Person 3 — stretch goal): Implement voice pipeline
    #
    # Recommended approach:
    # 1. Send audio to OpenAI Whisper API for transcription
    # 2. Parse transcript for amounts, dates, order counts
    # 3. Handle relative dates ("today", "yesterday", "semalam")
    #
    # Example with OpenAI Whisper:
    #   from openai import OpenAI
    #   client = OpenAI()
    #   transcript = client.audio.transcriptions.create(
    #       model="whisper-1",
    #       file=("audio.wav", file_bytes),
    #   )
    #   text = transcript.text
    #   # Then parse text for amounts

    return []
