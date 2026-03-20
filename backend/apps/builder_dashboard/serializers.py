from rest_framework import serializers
from .models import (
    Project, SiteUpdate, EscrowMilestone, CapitalSchedule,
    MaterialAudit, WeatherEvent, ESignatureRequest, SiteCamera,
    BOQBuildingItem, BOQProfessionalFee, BOQAdminExpense,
    BOQLabourCost, BOQMachinePlant, BOQLabourBreakdown, BOQScheduleTask,
    MaterialRequest, DrawingRequest, DrawingFile, ProjectTeam,
    BOQCorrection, ScheduleOfMaterial
)
from apps.authentication.models import Profile

class ArchitectProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='phone_number', read_only=True)

    class Meta:
        model = Profile
        fields = ('full_name', 'email', 'phone', 'avatar')

    def get_full_name(self, obj):
        # Handle cases where full name might be empty
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username

class ProjectTeamSerializer(serializers.ModelSerializer):
    user_details = ArchitectProfileSerializer(source='user.profile', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = ProjectTeam
        fields = ('id', 'project', 'user', 'role', 'status', 'notes', 'user_details', 'full_name', 'created_at')
        read_only_fields = ('created_at',)

class ProjectSerializer(serializers.ModelSerializer):
    architect_details = serializers.SerializerMethodField()
    team_members = ProjectTeamSerializer(many=True, read_only=True)
    total_team_count = serializers.SerializerMethodField()
    team_stats = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')

    def get_architect_details(self, obj):
        # 1. Check ProjectTeam first (Preferred flow)
        architect_member = obj.team_members.filter(role='architect', status='assigned').first()
        if architect_member:
            user = architect_member.user
            # Try Profile first
            if hasattr(user, 'profile'):
                return ArchitectProfileSerializer(user.profile).data
            # Fallback to ProfessionalProfile
            if hasattr(user, 'professional_profile'):
                pp = user.professional_profile
                return {
                    'full_name': user.get_full_name() or user.username,
                    'email': user.email,
                    'phone': pp.location, # Use location or bio as placeholder if no phone
                    'avatar': None
                }
            # Last resort: just user details
            return {
                'full_name': user.get_full_name() or user.username,
                'email': user.email,
                'phone': 'N/A',
                'avatar': None
            }

        # 2. Fallback to direct architect field
        if obj.architect:
            user = obj.architect
            if hasattr(user, 'profile'):
                return ArchitectProfileSerializer(user.profile).data
            return {
                'full_name': user.get_full_name() or user.username,
                'email': user.email,
                'phone': 'N/A',
                'avatar': None
            }
            
        return None

    def get_total_team_count(self, obj):
        return obj.team_members.count()

    def get_team_stats(self, obj):
        return {
            'pending': obj.team_members.filter(status='pending').count(),
            'assigned': obj.team_members.filter(status='assigned').count(),
            'completed': obj.team_members.filter(status='completed').count(),
        }

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

class BOQBuildingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOQBuildingItem
        fields = '__all__'
        read_only_fields = ('amount', 'created_at', 'updated_at')

class BOQProfessionalFeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOQProfessionalFee
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class BOQAdminExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOQAdminExpense
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class BOQLabourCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOQLabourCost
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class BOQMachinePlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOQMachinePlant
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class BOQLabourBreakdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOQLabourBreakdown
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class BOQScheduleTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOQScheduleTask
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ScheduleOfMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleOfMaterial
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class BOQCorrectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOQCorrection
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class MaterialRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequest
        fields = '__all__'
        read_only_fields = ('total_calculated_cost', 'created_at', 'updated_at')

class DrawingFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrawingFile
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class DrawingRequestSerializer(serializers.ModelSerializer):
    files = DrawingFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = DrawingRequest
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
