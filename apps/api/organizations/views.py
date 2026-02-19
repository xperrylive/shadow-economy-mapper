"""Organization views — stretch goal, implement after core features."""

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def org_placeholder(request):
    return Response({"message": "Organization dashboard coming soon."})
