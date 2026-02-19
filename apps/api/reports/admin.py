from django.contrib import admin
from .models import Report, ShareToken

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["business", "report_type", "created_at"]

@admin.register(ShareToken)
class ShareTokenAdmin(admin.ModelAdmin):
    list_display = ["report", "token", "expires_at", "access_count"]
