from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, MilestoneViewSet, SiteUpdateViewSet, ChangeOrderViewSet, BuilderConnectionsView, ProjectConnectionsView, EscrowSummaryView, PaymentViewSet, AllContractorsView

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'site-updates', SiteUpdateViewSet, basename='siteupdate')
router.register(r'change-orders', ChangeOrderViewSet, basename='changeorder')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('builder-connections/', BuilderConnectionsView.as_view(), name='builder-connections'),
    path('projects/<int:project_id>/connections/', ProjectConnectionsView.as_view(), name='project-connections'),
    path('escrow-summary/', EscrowSummaryView.as_view(), name='escrow-summary'),
    path('all-contractors/', AllContractorsView.as_view(), name='all-contractors'),
]
