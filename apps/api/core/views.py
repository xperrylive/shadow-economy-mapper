"""Core views: business profile and consent management."""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import BusinessProfile, ConsentSettings
from .serializers import BusinessProfileSerializer, ConsentSettingsSerializer


class BusinessProfileViewSet(viewsets.ModelViewSet):
    """CRUD for business profiles owned by the authenticated user."""

    serializer_class = BusinessProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BusinessProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        business = serializer.save(user=self.request.user)
        # Auto-create consent settings
        ConsentSettings.objects.create(business=business)

    @action(detail=True, methods=["get", "patch"])
    def consent(self, request, pk=None):
        """Get or update consent settings for a business."""
        business = self.get_object()
        consent, _ = ConsentSettings.objects.get_or_create(business=business)

        if request.method == "PATCH":
            serializer = ConsentSettingsSerializer(consent, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        return Response(ConsentSettingsSerializer(consent).data)
