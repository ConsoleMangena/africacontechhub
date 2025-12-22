from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContractorProfileViewSet, BidViewSet, WIPAAViewSet

router = DefaultRouter()
router.register(r'contractor-profiles', ContractorProfileViewSet, basename='contractorprofile')
router.register(r'bids', BidViewSet, basename='bid')
router.register(r'wipaa', WIPAAViewSet, basename='wipaa')

urlpatterns = [
    path('', include(router.urls)),
]
