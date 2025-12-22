import os
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from supabase import create_client, Client
from django.contrib.auth.models import User

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            raise AuthenticationFailed('Invalid token header. No credentials provided.')

        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
             raise AuthenticationFailed('Supabase credentials not configured.')

        supabase: Client = create_client(supabase_url, supabase_key)

        try:
            # Verify the token with Supabase
            # Use named argument to be explicit and compatible with supabase-py
            user_response = supabase.auth.get_user(jwt=token)
            user = user_response.user
            if user is None:
                raise AuthenticationFailed('Supabase user not found for provided token.')

            user_id = user.id
            email = user.email
            
            # Get or create the user in Django
            django_user, created = User.objects.get_or_create(username=user_id, defaults={'email': email})
            
            # Sync profile data from Supabase metadata on every login
            supabase_user_metadata = getattr(user, 'user_metadata', None) or getattr(user, 'raw_user_meta_data', None)
            if supabase_user_metadata:
                meta = supabase_user_metadata
                
                # Get or create profile
                if not hasattr(django_user, 'profile'):
                    from .models import Profile
                    Profile.objects.get_or_create(user=django_user)
                
                profile = django_user.profile
                profile_changed = False
                user_changed = False
                
                # Sync role (always update to ensure consistency)
                if 'role' in meta and meta['role']:
                    if profile.role != meta['role']:
                        profile.role = meta['role']
                        profile_changed = True
                
                # Sync names to User model
                if 'first_name' in meta and meta['first_name']:
                    if django_user.first_name != meta['first_name']:
                        django_user.first_name = meta['first_name']
                        user_changed = True
                        
                if 'last_name' in meta and meta['last_name']:
                    if django_user.last_name != meta['last_name']:
                        django_user.last_name = meta['last_name']
                        user_changed = True
                
                # Sync phone number to profile
                if 'phone_number' in meta and meta['phone_number']:
                    if profile.phone_number != meta['phone_number']:
                        profile.phone_number = meta['phone_number']
                        profile_changed = True
                
                # Save both if changed
                if user_changed:
                    django_user.save()
                if profile_changed:
                    profile.save()
            
            return (django_user, None)

        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
