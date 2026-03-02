from rest_framework import serializers
from .models import Project, Milestone, SiteUpdate, ChangeOrder, Payment, FloorPlanCategory, FloorPlanDataset

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

class FloorPlanCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FloorPlanCategory
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class FloorPlanDatasetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = FloorPlanDataset
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'created_at', 'updated_at')
