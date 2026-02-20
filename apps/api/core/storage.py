"""
Supabase Storage utilities.

Two public helpers:
  - upload_evidence_file(file_bytes, original_filename, business_id, content_type) -> str
  - upload_report_pdf(pdf_bytes, business_id, report_id) -> str

Both return the public URL of the uploaded object.
The Supabase client is created lazily so missing env vars only fail at call time.
"""

import mimetypes
import os
import uuid as _uuid

from django.conf import settings

EVIDENCE_BUCKET = "evidence-files"
REPORTS_BUCKET = "reports"


def _client():
    """Create a Supabase client using the service-role key (bypasses RLS)."""
    from supabase import create_client  # deferred — avoids startup crash if SDK missing

    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def upload_evidence_file(
    file_bytes: bytes,
    original_filename: str,
    business_id: str,
    content_type: str = "",
) -> str:
    """
    Upload a raw evidence file to Supabase Storage.

    The file is stored under ``<business_id>/<uuid><ext>`` so each business
    gets its own folder and filenames never collide.

    Args:
        file_bytes: Raw file content.
        original_filename: Original file name (used to derive the extension).
        business_id: UUID string of the owning business (used as folder prefix).
        content_type: MIME type; inferred from the filename when empty.

    Returns:
        Public URL string of the uploaded file.
    """
    ext = os.path.splitext(original_filename)[1] or ""
    dest_path = f"{business_id}/{_uuid.uuid4()}{ext}"

    if not content_type:
        content_type = (
            mimetypes.guess_type(original_filename)[0] or "application/octet-stream"
        )

    client = _client()
    client.storage.from_(EVIDENCE_BUCKET).upload(
        path=dest_path,
        file=file_bytes,
        file_options={"content-type": content_type},
    )
    return client.storage.from_(EVIDENCE_BUCKET).get_public_url(dest_path)


def upload_report_pdf(pdf_bytes: bytes, business_id: str, report_id: str) -> str:
    """
    Upload a generated PDF report to Supabase Storage.

    Stored under ``<business_id>/<report_id>.pdf``.

    Args:
        pdf_bytes: PDF file content.
        business_id: UUID string of the owning business.
        report_id: UUID string of the Report record.

    Returns:
        Public URL string of the uploaded PDF.
    """
    dest_path = f"{business_id}/{report_id}.pdf"
    client = _client()
    client.storage.from_(REPORTS_BUCKET).upload(
        path=dest_path,
        file=pdf_bytes,
        file_options={"content-type": "application/pdf"},
    )
    return client.storage.from_(REPORTS_BUCKET).get_public_url(dest_path)
