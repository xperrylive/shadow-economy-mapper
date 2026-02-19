from django.contrib import admin
from .models import BusinessProfile, ConsentSettings

@admin.register(BusinessProfile)
class BusinessProfileAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "category", "location", "created_at"]
    search_fields = ["name", "user__email"]

@admin.register(ConsentSettings)
class ConsentSettingsAdmin(admin.ModelAdmin):
    list_display = ["business", "share_mode", "redact_pii"]
