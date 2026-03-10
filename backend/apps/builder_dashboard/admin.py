from django.contrib import admin
from .models import (
    Project, SiteUpdate, EscrowMilestone, CapitalSchedule,
    MaterialAudit, WeatherEvent, ESignatureRequest, SiteCamera
)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'status', 'engagement_tier', 'budget', 'created_at')
    list_filter = ('status', 'engagement_tier', 'si56_verified')
    search_fields = ('title', 'location', 'owner__email')

@admin.register(SiteUpdate)
class SiteUpdateAdmin(admin.ModelAdmin):
    list_display = ('project', 'verified', 'created_at')
    search_fields = ('project__title', 'description')

@admin.register(EscrowMilestone)
class EscrowMilestoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'amount', 'status', 'released')
    list_filter = ('status', 'released')
    search_fields = ('name', 'project__title')

@admin.register(CapitalSchedule)
class CapitalScheduleAdmin(admin.ModelAdmin):
    list_display = ('description', 'project', 'amount', 'due_date', 'status')
    list_filter = ('status',)
    search_fields = ('description', 'project__title')

@admin.register(MaterialAudit)
class MaterialAuditAdmin(admin.ModelAdmin):
    list_display = ('material_name', 'project', 'delivered_qty', 'installed_qty', 'audit_passed')
    list_filter = ('audit_passed',)
    search_fields = ('material_name', 'project__title')

@admin.register(WeatherEvent)
class WeatherEventAdmin(admin.ModelAdmin):
    list_display = ('project', 'date', 'claimed_delay_days', 'actual_rainfall_mm', 'verdict')
    list_filter = ('verdict',)
    search_fields = ('project__title', 'contractor_claim')

@admin.register(ESignatureRequest)
class ESignatureRequestAdmin(admin.ModelAdmin):
    list_display = ('document_type', 'party_name', 'project', 'amount', 'status', 'due_date')
    list_filter = ('document_type', 'status')
    search_fields = ('party_name', 'project__title')

@admin.register(SiteCamera)
class SiteCameraAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'active', 'recording')
    list_filter = ('active', 'recording')
    search_fields = ('name', 'project__title')
