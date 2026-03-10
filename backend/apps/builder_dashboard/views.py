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
    BOQItem
)
from .serializers import (
    ProjectSerializer, SiteUpdateSerializer, EscrowMilestoneSerializer,
    CapitalScheduleSerializer, MaterialAuditSerializer, WeatherEventSerializer,
    ESignatureRequestSerializer, SiteCameraSerializer, BOQItemSerializer
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

class BOQItemViewSet(viewsets.ModelViewSet):
    serializer_class = BOQItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        qs = BOQItem.objects.filter(project__owner=self.request.user)
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        from django.shortcuts import get_object_or_404
        project = get_object_or_404(Project, id=self.request.data.get('project'), owner=self.request.user)
        serializer.save(project=project)

    @action(detail=False, methods=['post'])
    def generate_template(self, request):
        project_id = request.data.get('project')
        if not project_id:
            return Response({'error': 'Project ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        # Idempotency check: don't generate if items already exist
        if BOQItem.objects.filter(project=project).exists():
            return Response({'error': 'BOQ template has already been generated for this project.'}, status=status.HTTP_400_BAD_REQUEST)

        # Idempotency check: don't generate if items already exist
        if BOQItem.objects.filter(project=project).exists():
            return Response({'error': 'BOQ template has already been generated for this project.'}, status=status.HTTP_400_BAD_REQUEST)

        # Basic ZIQS Home Template Items
        template_items = [
            # Bill 1
            {'category': '1. Preliminaries & General', 'item_name': 'Site Clearance', 'unit': 'm²', 'description': 'Clear site of all rubbish, grass, and bushes'},
            {'category': '1. Preliminaries & General', 'item_name': 'Setting Out', 'unit': 'item', 'description': 'Setting out of the building'},
            # Bill 2
            {'category': '2. Earthworks & Excavation', 'item_name': 'Trench Excavation', 'unit': 'm³', 'description': 'Excavate trenches for foundations'},
            {'category': '2. Earthworks & Excavation', 'item_name': 'Hardcore Filling', 'unit': 'm³', 'description': 'Supply and fill with approved hardcore'},
            {'category': '2. Earthworks & Excavation', 'item_name': 'Ant Poisoning', 'unit': 'm²', 'description': 'Apply approved ant poison to surfaces'},
            # Bill 3
            {'category': '3. Concrete, Formwork & Reinforcement', 'item_name': 'Strip Footings', 'unit': 'm³', 'description': '20MPa concrete in strip footings'},
            {'category': '3. Concrete, Formwork & Reinforcement', 'item_name': 'Surface Bed', 'unit': 'm³', 'description': '20MPa concrete in surface bed'},
            {'category': '3. Concrete, Formwork & Reinforcement', 'item_name': 'BRC Mesh', 'unit': 'm²', 'description': 'Supply and fix welded mesh reinforcement'},
            # Bill 4
            {'category': '4. Brickwork & Blockwork', 'item_name': 'Foundation Brickwork', 'unit': 'm²', 'description': 'Half brick/one brick walling in foundation'},
            {'category': '4. Brickwork & Blockwork', 'item_name': 'Superstructure Brickwork', 'unit': 'm²', 'description': 'Common bricks in superstructure'},
            # Bill 5
            {'category': '5. Waterproofing', 'item_name': 'DPC (Damp Proof Course)', 'unit': 'm', 'description': 'Lay standard DPC under all brick walls'},
            {'category': '5. Waterproofing', 'item_name': 'DPM (Damp Proof Membrane)', 'unit': 'm²', 'description': 'Lay 250 micron polythene sheet under surface bed'},
            # Bill 7
            {'category': '7. Roof Coverings', 'item_name': 'Timber Trusses', 'unit': 'nr', 'description': 'Supply and fix standard sawn timber roof trusses'},
            {'category': '7. Roof Coverings', 'item_name': 'Roof Sheeting/Tiles', 'unit': 'm²', 'description': 'Supply and fit chromadek sheeting or concrete tiles'},
            # Bill 8
            {'category': '8. Plumbing & Drainage', 'item_name': 'Internal Plumbing', 'unit': 'item', 'description': 'First and second fix plumbing'},
            {'category': '8. Plumbing & Drainage', 'item_name': 'Sewer Connection', 'unit': 'item', 'description': 'Connect to main municipal sewer line'},
            # Bill 9
            {'category': '9. Electrical Installations', 'item_name': 'Tubing & Wiring', 'unit': 'item', 'description': 'First fix electrical tubing and wiring'},
            # Bill 10
            {'category': '10. Floor, Wall & Ceiling Finishes', 'item_name': 'Internal Plaster', 'unit': 'm²', 'description': 'Apply 15mm cement plaster to internal walls'},
            {'category': '10. Floor, Wall & Ceiling Finishes', 'item_name': 'Floor Screed', 'unit': 'm²', 'description': '30mm thick cement screed finishing'},
            {'category': '10. Floor, Wall & Ceiling Finishes', 'item_name': 'Ceiling Boards', 'unit': 'm²', 'description': 'Supply and fix skimmed ceiling boards'},
            # Bill 11
            {'category': '11. Glazing & Painting', 'item_name': 'Internal Painting', 'unit': 'm²', 'description': 'Prepare and apply 2 coats PVA'},
        ]

        created_count = 0
        for item in template_items:
            BOQItem.objects.create(
                project=project,
                category=item['category'],
                item_name=item['item_name'],
                unit=item['unit'],
                description=item['description'],
                quantity=0,
                rate=0
            )
            created_count += 1

        return Response({'message': f'Successfully generated {created_count} BOQ template line items.'})

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
