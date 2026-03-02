import os
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from supabase import create_client, Client
from django.contrib.auth.models import User


class SupabaseAuthentication(BaseAuthentication):
    """
    Validates Supabase JWT tokens and syncs user/profile/account-request
    data with Django on every authenticated request.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            raise AuthenticationFailed('Invalid token header.')

        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")

        if not supabase_url or not supabase_key:
            raise AuthenticationFailed('Supabase credentials not configured.')

        supabase: Client = create_client(supabase_url, supabase_key)

        try:
            user_response = supabase.auth.get_user(jwt=token)
            sb_user = user_response.user
            if sb_user is None:
                raise AuthenticationFailed('Supabase user not found.')

            user_id = sb_user.id
            email = sb_user.email
            raw_meta = (
                getattr(sb_user, 'user_metadata', None)
                or getattr(sb_user, 'raw_user_meta_data', None)
                or {}
            )

            # ── Get or create the Django user ────────────────────────────
            django_user, created = User.objects.get_or_create(
                username=user_id,
                defaults={'email': email},
            )

            role = raw_meta.get('role', 'BUILDER')
            first_name = raw_meta.get('first_name', '')
            last_name = raw_meta.get('last_name', '')
            phone_number = raw_meta.get('phone_number', '')

            from .models import Profile, AccountRequest

            # ── Ensure Profile exists ────────────────────────────────────
            if created:
                # Brand-new Django user → Profile starts as NOT approved
                django_user.email = email or ''
                django_user.first_name = first_name
                django_user.last_name = last_name
                django_user.save()

                profile, _ = Profile.objects.get_or_create(
                    user=django_user,
                    defaults={
                        'role': role,
                        'is_approved': False,
                        'first_name': first_name,
                        'last_name': last_name,
                        'phone_number': phone_number,
                    },
                )
            else:
                # Existing user → ensure profile exists, sync metadata
                profile, prof_created = Profile.objects.get_or_create(
                    user=django_user,
                    defaults={
                        'role': role,
                        'is_approved': False,
                    },
                )

                # Sync metadata changes from Supabase → Django
                user_changed = False
                profile_changed = False

                if first_name and django_user.first_name != first_name:
                    django_user.first_name = first_name
                    user_changed = True
                if last_name and django_user.last_name != last_name:
                    django_user.last_name = last_name
                    user_changed = True
                # Do NOT sync role from Supabase metadata — Django is the
                # source of truth for roles (admins manage them via the dashboard).
                if phone_number and profile.phone_number != phone_number:
                    profile.phone_number = phone_number
                    profile_changed = True

                if user_changed:
                    django_user.save()
                if profile_changed:
                    profile.save()

            # ── Ensure AccountRequest exists (for ALL unapproved users) ──
            if not profile.is_approved:
                AccountRequest.objects.get_or_create(
                    user=django_user,
                    defaults={
                        'requested_role': profile.role,
                        'status': 'PENDING',
                    },
                )

            return (django_user, None)

        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
