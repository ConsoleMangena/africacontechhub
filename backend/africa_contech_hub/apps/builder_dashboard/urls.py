from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, MilestoneViewSet, SiteUpdateViewSet, ChangeOrderViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'site-updates', SiteUpdateViewSet, basename='siteupdate')
router.register(r'change-orders', ChangeOrderViewSet, basename='changeorder')

urlpatterns = [
    path('', include(router.urls)),
]
