from django.contrib import admin
from .models import Evidence, LedgerEntry, EventLink, CredibilityScore

@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ["original_filename", "business", "source_type", "status", "uploaded_at"]
    list_filter = ["status", "source_type"]
    search_fields = ["original_filename", "business__name"]

@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ["business", "event_time", "amount", "channel", "event_type", "confidence"]
    list_filter = ["channel", "event_type"]

@admin.register(EventLink)
class EventLinkAdmin(admin.ModelAdmin):
    list_display = ["entry_a", "entry_b", "link_type", "similarity_score"]

@admin.register(CredibilityScore)
class CredibilityScoreAdmin(admin.ModelAdmin):
    list_display = ["business", "score", "confidence_level", "computed_at"]
