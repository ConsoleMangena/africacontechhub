from rest_framework import generics, permissions
from rest_framework.response import Response
from .serializers import UserSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the current authenticated user.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
