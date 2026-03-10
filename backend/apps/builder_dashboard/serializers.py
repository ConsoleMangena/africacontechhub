from rest_framework import serializers
from .models import (
    Project, SiteUpdate, EscrowMilestone, CapitalSchedule,
    MaterialAudit, WeatherEvent, ESignatureRequest, SiteCamera,
    BOQItem
)

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')

class SiteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteUpdate
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class EscrowMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscrowMilestone
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class CapitalScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapitalSchedule
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class MaterialAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialAudit
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class WeatherEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherEvent
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ESignatureRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ESignatureRequest
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class SiteCameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteCamera
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class BOQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOQItem
        fields = '__all__'
        read_only_fields = ('total_amount', 'created_at', 'updated_at')
