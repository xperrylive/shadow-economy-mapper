"""Custom DRF exception handler with consistent error format."""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Return errors in a consistent JSON format."""
    response = exception_handler(exc, context)

    if response is not None:
        return Response(
            {
                "error": True,
                "message": _extract_message(response.data),
                "details": response.data,
            },
            status=response.status_code,
        )

    # Unhandled exception
    return Response(
        {"error": True, "message": "Internal server error."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _extract_message(data):
    """Pull a readable message from DRF error data."""
    if isinstance(data, dict):
        first_key = next(iter(data), None)
        if first_key:
            val = data[first_key]
            if isinstance(val, list):
                return str(val[0])
            return str(val)
    if isinstance(data, list):
        return str(data[0])
    return str(data)
