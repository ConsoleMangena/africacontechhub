from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['role', 'phone_number', 'first_name', 'last_name', 'supabase_id', 'avatar', 'address']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    avatar = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'avatar']

    def update(self, instance, validated_data):
        print(f"DEBUG: UserSerializer.update called with data: {validated_data}")
        profile_data = validated_data.pop('profile', None)
        avatar = validated_data.pop('avatar', None)
        print(f"DEBUG: profile_data extracted: {profile_data}")
        
        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile fields
        profile = instance.profile
        if profile_data:
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
        
        if avatar:
            profile.avatar = avatar
            
        if profile_data or avatar:
            profile.save()
            print(f"DEBUG: Profile updated. New role: {profile.role}")

        return instance
