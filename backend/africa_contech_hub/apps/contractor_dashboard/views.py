from rest_framework import viewsets, permissions, exceptions
from .models import ContractorProfile, Bid, WIPAA
from .serializers import ContractorProfileSerializer, BidSerializer, WIPAASerializer
from apps.authentication.permissions import IsContractor

class ContractorProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ContractorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsContractor]

    def get_queryset(self):
        return ContractorProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if ContractorProfile.objects.filter(user=self.request.user).exists():
            raise exceptions.ValidationError("Profile already exists for this user.")
        serializer.save(user=self.request.user)

class BidViewSet(viewsets.ModelViewSet):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated, IsContractor]

    def get_queryset(self):
        return Bid.objects.filter(contractor__user=self.request.user)

    def perform_create(self, serializer):
        try:
            contractor = self.request.user.contractor_profile
        except ContractorProfile.DoesNotExist:
            raise exceptions.ValidationError("User does not have a contractor profile.")
        serializer.save(contractor=contractor)

class WIPAAViewSet(viewsets.ModelViewSet):
    serializer_class = WIPAASerializer
    permission_classes = [permissions.IsAuthenticated, IsContractor]

    def get_queryset(self):
        return WIPAA.objects.filter(contractor__user=self.request.user)

    def perform_create(self, serializer):
        try:
            contractor = self.request.user.contractor_profile
        except ContractorProfile.DoesNotExist:
            raise exceptions.ValidationError("User does not have a contractor profile.")
        serializer.save(contractor=contractor)
