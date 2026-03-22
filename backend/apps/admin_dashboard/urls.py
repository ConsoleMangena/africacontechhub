from django.urls import path
from .views import (
    AdminUserManagementView, AccountRequestView, SystemMetricsView, AIAnalyticsView,
    FloorPlanCategoryView, FloorPlanDatasetView,
    AdminProjectsView, AdminBillingView,
    PlatformSettingsView, AdminActivityLogView,
    AdminProcurementView, AdminProfessionalManagementView,
)

urlpatterns = [
    path('metrics/', SystemMetricsView.as_view(), name='admin-metrics'),
    path('users/', AdminUserManagementView.as_view(), name='admin-users'),
    path('users/<int:pk>/', AdminUserManagementView.as_view(), name='admin-users-detail'),
    path('requests/', AccountRequestView.as_view(), name='account-requests'),
    path('requests/<int:pk>/', AccountRequestView.as_view(), name='account-requests-detail'),
    path('ai-analytics/', AIAnalyticsView.as_view(), name='admin-ai-analytics'),
    # Floor Plans
    path('floor-plan-categories/', FloorPlanCategoryView.as_view(), name='admin-floor-plan-categories'),
    path('floor-plan-categories/<int:pk>/', FloorPlanCategoryView.as_view(), name='admin-floor-plan-categories-detail'),
    path('floor-plans/', FloorPlanDatasetView.as_view(), name='admin-floor-plans'),
    path('floor-plans/<int:pk>/', FloorPlanDatasetView.as_view(), name='admin-floor-plans-detail'),
    # Projects
    path('projects/', AdminProjectsView.as_view(), name='admin-projects'),
    # Billing
    path('billing/', AdminBillingView.as_view(), name='admin-billing'),
    # Settings
    path('settings/', PlatformSettingsView.as_view(), name='admin-settings'),
    # Activity Log
    path('activity-log/', AdminActivityLogView.as_view(), name='admin-activity-log'),
    # Procurement Oversight
    path('procurement/', AdminProcurementView.as_view(), name='admin-procurement'),
    # Building Team (Professionals)
    path('professional-profiles/', AdminProfessionalManagementView.as_view(), name='admin-professionals'),
    path('professional-profiles/<int:pk>/', AdminProfessionalManagementView.as_view(), name='admin-professionals-detail'),
]
