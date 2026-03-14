from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, SiteUpdateViewSet, BuilderConnectionsView,
    ProjectConnectionsView, AllContractorsView, ProjectDashboardView,
    EscrowMilestoneViewSet, CapitalScheduleViewSet, MaterialAuditViewSet,
    WeatherEventViewSet, ESignatureRequestViewSet, SiteCameraViewSet,
    BOQItemViewSet, MaterialRequestViewSet, DrawingRequestViewSet, DrawingFileViewSet,
    ProjectTeamViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'site-updates', SiteUpdateViewSet, basename='siteupdate')
router.register(r'escrow-milestones', EscrowMilestoneViewSet, basename='escrowmilestone')
router.register(r'capital-schedules', CapitalScheduleViewSet, basename='capitalschedule')
router.register(r'material-audits', MaterialAuditViewSet, basename='materialaudit')
router.register(r'weather-events', WeatherEventViewSet, basename='weatherevent')
router.register(r'esignature-requests', ESignatureRequestViewSet, basename='esignaturerequest')
router.register(r'site-cameras', SiteCameraViewSet, basename='sitecamera')
router.register(r'boq-items', BOQItemViewSet, basename='boqitem')
router.register(r'material-requests', MaterialRequestViewSet, basename='materialrequest')
router.register(r'drawing-requests', DrawingRequestViewSet, basename='drawingrequest')
router.register(r'drawing-files', DrawingFileViewSet, basename='drawingfile')
router.register(r'project-team', ProjectTeamViewSet, basename='projectteam')

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<int:pk>/dashboard/', ProjectDashboardView.as_view(), name='project-dashboard'),
    path('builder-connections/', BuilderConnectionsView.as_view(), name='builder-connections'),
    path('projects/<int:project_id>/connections/', ProjectConnectionsView.as_view(), name='project-connections'),
    path('all-contractors/', AllContractorsView.as_view(), name='all-contractors'),
]
