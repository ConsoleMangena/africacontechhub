from django.urls import path
from .views import AdminUserManagementView, AccountRequestView, SystemMetricsView, AIAnalyticsView

urlpatterns = [
    path('metrics/', SystemMetricsView.as_view(), name='admin-metrics'),
    path('users/', AdminUserManagementView.as_view(), name='admin-users'),
    path('users/<int:pk>/', AdminUserManagementView.as_view(), name='admin-users-detail'),
    path('requests/', AccountRequestView.as_view(), name='account-requests'),
    path('requests/<int:pk>/', AccountRequestView.as_view(), name='account-requests-detail'),
    path('ai-analytics/', AIAnalyticsView.as_view(), name='admin-ai-analytics'),
]
