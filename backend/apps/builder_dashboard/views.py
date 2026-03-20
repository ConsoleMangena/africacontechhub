from rest_framework import viewsets, permissions, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q, Avg
from django.db import models
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import (
    Project, SiteUpdate, EscrowMilestone, CapitalSchedule,
    MaterialAudit, WeatherEvent, ESignatureRequest, SiteCamera,
    BOQBuildingItem, BOQProfessionalFee, BOQAdminExpense,
    BOQLabourCost, BOQMachinePlant, BOQLabourBreakdown, BOQScheduleTask,
    MaterialRequest, DrawingRequest, DrawingFile, ProjectTeam,
    BOQCorrection, ScheduleOfMaterial
)
from .serializers import (
    ProjectSerializer, SiteUpdateSerializer, EscrowMilestoneSerializer,
    CapitalScheduleSerializer, MaterialAuditSerializer, WeatherEventSerializer,
    ESignatureRequestSerializer, SiteCameraSerializer, BOQBuildingItemSerializer,
    BOQProfessionalFeeSerializer, BOQAdminExpenseSerializer, BOQLabourCostSerializer,
    BOQMachinePlantSerializer, BOQLabourBreakdownSerializer, BOQScheduleTaskSerializer,
    MaterialRequestSerializer, DrawingRequestSerializer, DrawingFileSerializer,
    ProjectTeamSerializer, BOQCorrectionSerializer, ScheduleOfMaterialSerializer
)
from apps.authentication.permissions import IsBuilder, IsAdmin
from apps.contractor_dashboard.models import Bid, ContractorProfile, ContractorRating
from apps.supplier_dashboard.models import MaterialOrder, SupplierProfile

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class SiteUpdateViewSet(viewsets.ModelViewSet):
    serializer_class = SiteUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return SiteUpdate.objects.filter(project__owner=self.request.user)

class ProjectDashboardView(views.APIView):
    """
    Unified endpoint returning all widget data for a project detail view.
    GET /api/v1/projects/<pk>/dashboard/
    """
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get(self, request, pk):
        try:
            project = Project.objects.get(id=pk, owner=request.user)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=404)

        return Response({
            'escrow_milestones': EscrowMilestoneSerializer(
                project.escrow_milestones.all(), many=True
            ).data,
            'capital_schedule': CapitalScheduleSerializer(
                project.capital_schedules.all(), many=True
            ).data,
            'material_audits': MaterialAuditSerializer(
                project.material_audits.all(), many=True
            ).data,
            'weather_events': WeatherEventSerializer(
                project.weather_events.all(), many=True
            ).data,
            'esignature_requests': ESignatureRequestSerializer(
                project.esignature_requests.filter(status='pending'), many=True
            ).data,
            'site_cameras': SiteCameraSerializer(
                project.site_cameras.all(), many=True
            ).data,
            'unverified_updates': SiteUpdateSerializer(
                project.site_updates.filter(verified=False), many=True
            ).data,
        })

class EscrowMilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = EscrowMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return EscrowMilestone.objects.filter(project__owner=self.request.user)

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        project = get_object_or_404(Project, id=self.request.data.get('project'), owner=self.request.user)
        serializer.save(project=project)

class CapitalScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = CapitalScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return CapitalSchedule.objects.filter(project__owner=self.request.user)

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        project = get_object_or_404(Project, id=self.request.data.get('project'), owner=self.request.user)
        serializer.save(project=project)

class MaterialAuditViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialAuditSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        qs = MaterialAudit.objects.filter(project__owner=self.request.user)
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        project = get_object_or_404(Project, id=self.request.data.get('project'), owner=self.request.user)
        serializer.save(project=project)

class WeatherEventViewSet(viewsets.ModelViewSet):
    serializer_class = WeatherEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return WeatherEvent.objects.filter(project__owner=self.request.user)

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        project = get_object_or_404(Project, id=self.request.data.get('project'), owner=self.request.user)
        serializer.save(project=project)

class ESignatureRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ESignatureRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        qs = ESignatureRequest.objects.filter(project__owner=self.request.user)
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        project = get_object_or_404(Project, id=self.request.data.get('project'), owner=self.request.user)
        serializer.save(project=project)

class SiteCameraViewSet(viewsets.ModelViewSet):
    serializer_class = SiteCameraSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return SiteCamera.objects.filter(project__owner=self.request.user)

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        project = get_object_or_404(Project, id=self.request.data.get('project'), owner=self.request.user)
        serializer.save(project=project)

class BOQCorrectionMixin:
    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        from django.contrib.contenttypes.models import ContentType
        project = get_object_or_404(Project, id=self.request.data.get('project'), owner=self.request.user)
        
        is_ai = str(self.request.data.get('is_ai_generated', False)).lower() == 'true'
        instance = serializer.save(project=project, is_ai_generated=is_ai)
        
        ct = ContentType.objects.get_for_model(instance)
        BOQCorrection.objects.create(
            project=project,
            user=self.request.user,
            content_type=ct,
            object_id=instance.id,
            action='CREATE',
            was_ai_generated=is_ai,
            previous_data=None,
            new_data=self.get_serializer(instance).data
        )

    def perform_update(self, serializer):
        from django.contrib.contenttypes.models import ContentType
        old_instance = self.get_object()
        old_data = self.get_serializer(old_instance).data
        was_ai = getattr(old_instance, 'is_ai_generated', False)
        
        instance = serializer.save()
        new_data = self.get_serializer(instance).data
        
        ct = ContentType.objects.get_for_model(instance)
        BOQCorrection.objects.create(
            project=instance.project,
            user=self.request.user,
            content_type=ct,
            object_id=instance.id,
            action='UPDATE',
            was_ai_generated=was_ai,
            previous_data=old_data,
            new_data=new_data
        )

    def perform_destroy(self, instance):
        old_data = self.get_serializer(instance).data
        project = instance.project
        was_ai = getattr(instance, 'is_ai_generated', False)
        
        # We cannot link to a deleted object using generic foreign key,
        # so we leave content_type/object_id blank.
        BOQCorrection.objects.create(
            project=project,
            user=self.request.user,
            content_type=None,
            object_id=None,
            action='DELETE',
            was_ai_generated=was_ai,
            previous_data=old_data,
            new_data=None
        )
        instance.delete()

class BOQBuildingItemViewSet(BOQCorrectionMixin, viewsets.ModelViewSet):
    serializer_class = BOQBuildingItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]
    def get_queryset(self):
        qs = BOQBuildingItem.objects.filter(project__owner=self.request.user)
        if pid := self.request.query_params.get('project'): qs = qs.filter(project_id=pid)
        return qs

class BOQProfessionalFeeViewSet(BOQCorrectionMixin, viewsets.ModelViewSet):
    serializer_class = BOQProfessionalFeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]
    def get_queryset(self):
        qs = BOQProfessionalFee.objects.filter(project__owner=self.request.user)
        if pid := self.request.query_params.get('project'): qs = qs.filter(project_id=pid)
        return qs

class BOQAdminExpenseViewSet(BOQCorrectionMixin, viewsets.ModelViewSet):
    serializer_class = BOQAdminExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]
    def get_queryset(self):
        qs = BOQAdminExpense.objects.filter(project__owner=self.request.user)
        if pid := self.request.query_params.get('project'): qs = qs.filter(project_id=pid)
        return qs

class BOQLabourCostViewSet(BOQCorrectionMixin, viewsets.ModelViewSet):
    serializer_class = BOQLabourCostSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]
    def get_queryset(self):
        qs = BOQLabourCost.objects.filter(project__owner=self.request.user)
        if pid := self.request.query_params.get('project'): qs = qs.filter(project_id=pid)
        return qs

class BOQMachinePlantViewSet(BOQCorrectionMixin, viewsets.ModelViewSet):
    serializer_class = BOQMachinePlantSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]
    def get_queryset(self):
        qs = BOQMachinePlant.objects.filter(project__owner=self.request.user)
        if pid := self.request.query_params.get('project'): qs = qs.filter(project_id=pid)
        return qs

class BOQLabourBreakdownViewSet(BOQCorrectionMixin, viewsets.ModelViewSet):
    serializer_class = BOQLabourBreakdownSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]
    def get_queryset(self):
        qs = BOQLabourBreakdown.objects.filter(project__owner=self.request.user)
        if pid := self.request.query_params.get('project'): qs = qs.filter(project_id=pid)
        return qs

class BOQScheduleTaskViewSet(BOQCorrectionMixin, viewsets.ModelViewSet):
    serializer_class = BOQScheduleTaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]
    def get_queryset(self):
        qs = BOQScheduleTask.objects.filter(project__owner=self.request.user)
        if pid := self.request.query_params.get('project'): qs = qs.filter(project_id=pid)
        return qs

class ScheduleOfMaterialViewSet(BOQCorrectionMixin, viewsets.ModelViewSet):
    serializer_class = ScheduleOfMaterialSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]
    def get_queryset(self):
        qs = ScheduleOfMaterial.objects.filter(project__owner=self.request.user)
        if pid := self.request.query_params.get('project'): qs = qs.filter(project_id=pid)
        return qs

class BudgetAggregateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsBuilder]
    
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, owner=request.user)
        return Response({
            'building_items': BOQBuildingItemSerializer(project.building_items.all(), many=True).data,
            'professional_fees': BOQProfessionalFeeSerializer(project.professional_fees.all(), many=True).data,
            'admin_expenses': BOQAdminExpenseSerializer(project.admin_expenses.all(), many=True).data,
            'labour_costs': BOQLabourCostSerializer(project.labour_costs.all(), many=True).data,
            'machine_plants': BOQMachinePlantSerializer(project.machine_plants.all(), many=True).data,
            'labour_breakdowns': BOQLabourBreakdownSerializer(project.labour_breakdowns.all(), many=True).data,
            'schedule_tasks': BOQScheduleTaskSerializer(project.schedule_tasks.all(), many=True).data,
            'schedule_materials': ScheduleOfMaterialSerializer(project.schedule_materials.all(), many=True).data,
        })

class BuilderConnectionsView(views.APIView):
    """
    Get all contractors and suppliers connected to the builder's projects
    """
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get(self, request):
        user = request.user
        
        # Get all projects owned by this builder
        projects = Project.objects.filter(owner=user)
        project_ids = projects.values_list('id', flat=True)
        
        # Get unique contractors who have bids on builder's projects
        contractor_bids = Bid.objects.filter(project_id__in=project_ids).select_related('contractor', 'contractor__user', 'contractor__user__profile')
        contractors = {}
        for bid in contractor_bids:
            contractor = bid.contractor
            if contractor.id not in contractors:
                # Get average rating for this contractor
                ratings = ContractorRating.objects.filter(contractor=contractor)
                ratings_count = ratings.count()
                average_rating = float(ratings.aggregate(Avg('rating'))['rating__avg'] or 0)
                
                # Get completed projects count
                completed_projects = Project.objects.filter(
                    bids__contractor=contractor,
                    bids__status='ACCEPTED',
                    status='COMPLETED'
                ).distinct().count()
                
                contractors[contractor.id] = {
                    'id': contractor.id,
                    'company_name': contractor.company_name,
                    'license_number': contractor.license_number,
                    'created_at': contractor.created_at.isoformat() if contractor.created_at else None,
                    'updated_at': contractor.updated_at.isoformat() if contractor.updated_at else None,
                    'user': {
                        'id': contractor.user.id,
                        'email': contractor.user.email,
                        'first_name': contractor.user.first_name,
                        'last_name': contractor.user.last_name,
                        'phone_number': getattr(contractor.user.profile, 'phone_number', None) if hasattr(contractor.user, 'profile') else None,
                    },
                    'average_rating': round(average_rating, 1) if average_rating > 0 else None,
                    'ratings_count': ratings_count,
                    'completed_projects_count': completed_projects,
                    'projects': []
                }
            
            if bid.project.title not in contractors[contractor.id]['projects']:
                contractors[contractor.id]['projects'].append(bid.project.title)
        
        # Get unique suppliers who have orders on builder's projects
        supplier_orders = MaterialOrder.objects.filter(project_id__in=project_ids).select_related('supplier', 'supplier__user', 'supplier__user__profile')
        suppliers = {}
        for order in supplier_orders:
            supplier = order.supplier
            if supplier.id not in suppliers:
                suppliers[supplier.id] = {
                    'id': supplier.id,
                    'company_name': supplier.company_name,
                    'on_time_rate': float(supplier.on_time_rate),
                    'defect_rate': float(supplier.defect_rate),
                    'user': {
                        'id': supplier.user.id,
                        'email': supplier.user.email,
                        'first_name': supplier.user.first_name,
                        'last_name': supplier.user.last_name,
                        'phone_number': getattr(supplier.user.profile, 'phone_number', None) if hasattr(supplier.user, 'profile') else None,
                    },
                    'orders_count': 0,
                    'projects': []
                }
            suppliers[supplier.id]['orders_count'] += 1
            if order.project.title not in suppliers[supplier.id]['projects']:
                suppliers[supplier.id]['projects'].append(order.project.title)
        
        return Response({
            'contractors': list(contractors.values()),
            'suppliers': list(suppliers.values()),
        })

class ProjectConnectionsView(views.APIView):
    """
    Get all contractors and suppliers connected to a specific project
    """
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=404)
        
        # Get contractors who have bids on this project
        contractor_bids = Bid.objects.filter(project=project).select_related('contractor', 'contractor__user', 'contractor__user__profile').order_by('-created_at')
        contractors = {}
        for bid in contractor_bids:
            contractor = bid.contractor
            if contractor.id not in contractors:
                contractors[contractor.id] = {
                    'id': contractor.id,
                    'company_name': contractor.company_name,
                    'license_number': contractor.license_number,
                    'user': {
                        'id': contractor.user.id,
                        'email': contractor.user.email,
                        'first_name': contractor.user.first_name,
                        'last_name': contractor.user.last_name,
                        'phone_number': getattr(contractor.user.profile, 'phone_number', None) if hasattr(contractor.user, 'profile') else None,
                    },
                    'bids_count': 0,
                    'latest_bid_status': None,
                }
            contractors[contractor.id]['bids_count'] += 1
            # Track the latest bid status (first one in ordered list is latest)
            if not contractors[contractor.id]['latest_bid_status']:
                contractors[contractor.id]['latest_bid_status'] = bid.status
        
        # Get suppliers who have orders on this project
        supplier_orders = MaterialOrder.objects.filter(project=project).select_related('supplier', 'supplier__user', 'supplier__user__profile').order_by('-created_at')
        suppliers = {}
        for order in supplier_orders:
            supplier = order.supplier
            if supplier.id not in suppliers:
                suppliers[supplier.id] = {
                    'id': supplier.id,
                    'company_name': supplier.company_name,
                    'on_time_rate': float(supplier.on_time_rate),
                    'defect_rate': float(supplier.defect_rate),
                    'user': {
                        'id': supplier.user.id,
                        'email': supplier.user.email,
                        'first_name': supplier.user.first_name,
                        'last_name': supplier.user.last_name,
                        'phone_number': getattr(supplier.user.profile, 'phone_number', None) if hasattr(supplier.user, 'profile') else None,
                    },
                    'orders_count': 0,
                    'latest_order_status': None,
                }
            suppliers[supplier.id]['orders_count'] += 1
            # Track the latest order status (first one in ordered list is latest)
            if not suppliers[supplier.id]['latest_order_status']:
                suppliers[supplier.id]['latest_order_status'] = order.status
        
        return Response({
            'contractors': list(contractors.values()),
            'suppliers': list(suppliers.values()),
        })

class AllContractorsView(views.APIView):
    """
    Get all contractors in the system for builders to browse
    """
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get(self, request):
        contractors_list = ContractorProfile.objects.all().select_related('user', 'user__profile')
        
        contractors_data = []
        for contractor in contractors_list:
            # Get average rating from ContractorRating
            ratings = ContractorRating.objects.filter(contractor=contractor)
            ratings_count = ratings.count()
            average_rating = float(ratings.aggregate(Avg('rating'))['rating__avg'] or 0)
            
            # Get completed projects count (projects where contractor has accepted bid and project is completed)
            completed_projects = Project.objects.filter(
                bids__contractor=contractor,
                bids__status='ACCEPTED',
                status='COMPLETED'
            ).distinct().count()
            
            # Get projects this contractor has worked on (accepted bids)
            projects = list(Project.objects.filter(
                bids__contractor=contractor,
                bids__status='ACCEPTED'
            ).values_list('title', flat=True).distinct())
            
            contractors_data.append({
                'id': contractor.id,
                'company_name': contractor.company_name,
                'license_number': contractor.license_number,
                'created_at': contractor.created_at.isoformat() if contractor.created_at else None,
                'updated_at': contractor.updated_at.isoformat() if contractor.updated_at else None,
                'user': {
                    'id': contractor.user.id,
                    'email': contractor.user.email,
                    'first_name': contractor.user.first_name,
                    'last_name': contractor.user.last_name,
                    'phone_number': getattr(contractor.user.profile, 'phone_number', None) if hasattr(contractor.user, 'profile') else None,
                },
                'average_rating': round(average_rating, 1) if average_rating > 0 else None,
                'ratings_count': ratings_count,
                'completed_projects_count': completed_projects,
                'projects': projects,
            })
        
        return Response({
            'contractors': contractors_data,
        })

class IsAdminOrReadOnlyBuilder(permissions.BasePermission):
    """
    Custom permission:
    - Admin users have full CRUD access.
    - Builder users have read-only access (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and hasattr(request.user, 'profile')):
            return False
            
        role = request.user.profile.role
        if role == 'ADMIN':
            return True
            
        if role == 'BUILDER' and request.method in permissions.SAFE_METHODS:
            return True
            
        return False

class MaterialRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        qs = MaterialRequest.objects.filter(project__owner=self.request.user)
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        from django.contrib.contenttypes.models import ContentType
        project_id = self.request.data.get('project')
        category = self.request.data.get('procurement_category', 'MATERIAL')
        boq_item_id = self.request.data.get('boq_item')
        
        project = get_object_or_404(Project, id=project_id, owner=self.request.user)
        
        content_type = None
        object_id = None
        
        if boq_item_id:
            object_id = boq_item_id
            if category == 'MATERIAL':
                content_type = ContentType.objects.get_for_model(BOQBuildingItem)
            elif category == 'LABOUR':
                content_type = ContentType.objects.get_for_model(BOQLabourCost)
            elif category == 'PLANT':
                content_type = ContentType.objects.get_for_model(BOQMachinePlant)
            elif category == 'PROFESSIONAL':
                content_type = ContentType.objects.get_for_model(BOQProfessionalFee)
            elif category == 'ADMIN':
                content_type = ContentType.objects.get_for_model(BOQAdminExpense)

        serializer.save(
            project=project,
            content_type=content_type,
            object_id=object_id
        )

class DrawingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = DrawingRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        qs = DrawingRequest.objects.filter(project__owner=self.request.user).prefetch_related('files')
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        project_id = self.request.data.get('project')
        project = get_object_or_404(Project, id=project_id, owner=self.request.user)
        serializer.save(project=project)

class DrawingFileViewSet(viewsets.ModelViewSet):
    serializer_class = DrawingFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return DrawingFile.objects.filter(request__project__owner=self.request.user)

    def perform_create(self, serializer):
        request_id = self.request.data.get('request')
        drawing_request = get_object_or_404(DrawingRequest, id=request_id, project__owner=self.request.user)
        serializer.save(request=drawing_request)
class ProjectTeamViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectTeamSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        qs = ProjectTeam.objects.filter(project__owner=self.request.user)
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        project = get_object_or_404(Project, id=project_id, owner=self.request.user)
        serializer.save(project=project)
