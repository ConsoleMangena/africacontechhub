from django.contrib import admin
from .models import Project, Milestone, SiteUpdate, ChangeOrder

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'status', 'engagement_tier', 'budget', 'created_at')
    list_filter = ('status', 'engagement_tier', 'si56_verified')
    search_fields = ('title', 'location')

admin.site.register(Milestone)
admin.site.register(SiteUpdate)
admin.site.register(ChangeOrder)
