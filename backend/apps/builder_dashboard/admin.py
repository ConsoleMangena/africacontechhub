from django.contrib import admin
from .models import Project, Milestone, SiteUpdate, ChangeOrder


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'status', 'engagement_tier', 'budget', 'created_at')
    list_filter = ('status', 'engagement_tier', 'si56_verified')
    search_fields = ('title', 'location', 'owner__email')


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'status', 'amount', 'due_date')
    list_filter = ('status',)
    search_fields = ('name', 'project__title')


@admin.register(SiteUpdate)
class SiteUpdateAdmin(admin.ModelAdmin):
    list_display = ('project', 'verified', 'created_at')
    search_fields = ('project__title', 'description')


@admin.register(ChangeOrder)
class ChangeOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'status', 'amount', 'created_at')
    list_filter = ('status',)
    search_fields = ('project__title', 'description')
