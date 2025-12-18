from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .serializers import UserSerializer
from .models import Profile

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        # Extract Profile data
        profile_data = request.data.get('profile', {})
        # Extract User data
        username = request.data.get('email') # Use email as username
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        # Additional fields from frontend registration
        phone_number = request.data.get('phone_number', '')
        role = request.data.get('role', 'BUILDER')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
             return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create User
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Update Profile
        # User creation signals might create a profile, or we update manual one if we implemented signal?
        # Assuming Profile is created by signal or here.
        # Let's check if Profile exists or create.
        if hasattr(user, 'profile'):
            profile = user.profile
        else:
            profile = Profile.objects.create(user=user)
        
        profile.role = role
        profile.phone_number = phone_number
        profile.first_name = first_name
        profile.last_name = last_name
        profile.save()

        # Create Token
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'role': profile.role
        }, status=status.HTTP_201_CREATED)

class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        # We expect 'email' and 'password'
        # ObtainAuthToken expects 'username', but we treat email as username
        # So we might need to map email to username if standard Authenticate is used.
        # But our Register sets username=email. So it matches.
        
        # However, standard ObtainAuthToken serializer uses 'username' field.
        # We can just copy request.data and ensure username is set to email.
        
        data = request.data.copy()
        if 'email' in data and 'username' not in data:
            data['username'] = data['email']
            
        serializer = self.serializer_class(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'role': user.profile.role if hasattr(user, 'profile') else 'BUILDER'
        })

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
