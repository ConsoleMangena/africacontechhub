from rest_framework import viewsets, permissions
from .models import ArchitecturalStudioItem
from .serializers import ArchitecturalStudioItemSerializer
from apps.authentication.permissions import IsBuilder

class ArchitecturalStudioItemViewSet(viewsets.ModelViewSet):
    serializer_class = ArchitecturalStudioItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return ArchitecturalStudioItem.objects.filter(project__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save()
