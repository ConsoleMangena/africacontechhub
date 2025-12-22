from rest_framework import serializers
from .models import Project, Milestone, SiteUpdate, ChangeOrder, Payment

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class SiteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteUpdate
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ChangeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangeOrder
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
