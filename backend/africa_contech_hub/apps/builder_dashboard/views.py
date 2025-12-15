from rest_framework import viewsets, permissions
from .models import Project, Milestone, SiteUpdate, ChangeOrder
from .serializers import ProjectSerializer, MilestoneSerializer, SiteUpdateSerializer, ChangeOrderSerializer
from apps.authentication.permissions import IsBuilder

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return Milestone.objects.filter(project__owner=self.request.user)

class SiteUpdateViewSet(viewsets.ModelViewSet):
    serializer_class = SiteUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return SiteUpdate.objects.filter(project__owner=self.request.user)

class ChangeOrderViewSet(viewsets.ModelViewSet):
    serializer_class = ChangeOrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return ChangeOrder.objects.filter(project__owner=self.request.user)
