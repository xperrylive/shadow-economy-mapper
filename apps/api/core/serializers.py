"""Serializers for core models."""

from rest_framework import serializers
from .models import BusinessProfile, ConsentSettings


class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields = ["id", "name", "category", "location", "channels", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class ConsentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsentSettings
        fields = ["share_mode", "redact_pii", "store_raw_files", "risk_disclosure_accepted", "updated_at"]
        read_only_fields = ["updated_at"]
