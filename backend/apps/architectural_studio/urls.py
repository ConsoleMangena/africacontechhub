from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArchitecturalStudioItemViewSet

router = DefaultRouter()
router.register(r'items', ArchitecturalStudioItemViewSet, basename='studioitem')

urlpatterns = [
    path('', include(router.urls)),
]
