from rest_framework import viewsets, permissions, views
from rest_framework.response import Response
from django.db.models import Sum, Q, Avg
from django.db import models
from django.utils import timezone
from .models import Project, Milestone, SiteUpdate, ChangeOrder, Payment
from .serializers import ProjectSerializer, MilestoneSerializer, SiteUpdateSerializer, ChangeOrderSerializer, PaymentSerializer
from django.utils import timezone
from apps.authentication.permissions import IsBuilder
from apps.contractor_dashboard.models import Bid, ContractorProfile, ContractorRating
from apps.supplier_dashboard.models import MaterialOrder, SupplierProfile

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        queryset = Milestone.objects.filter(project__owner=self.request.user)
        # Filter by project if provided
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

class SiteUpdateViewSet(viewsets.ModelViewSet):
    serializer_class = SiteUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return SiteUpdate.objects.filter(project__owner=self.request.user)

class ChangeOrderViewSet(viewsets.ModelViewSet):
    serializer_class = ChangeOrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        return ChangeOrder.objects.filter(project__owner=self.request.user)

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

class EscrowSummaryView(views.APIView):
    """
    Get escrow/payment summary for all builder's projects
    """
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get(self, request):
        user = request.user
        projects = Project.objects.filter(owner=user).prefetch_related('milestones')
        
        escrow_data = []
        
        for project in projects:
            # Calculate total paid (sum of PAID milestones)
            total_paid = project.milestones.filter(status='PAID').aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            # Calculate remaining balance
            remaining_balance = float(project.budget) - float(total_paid)
            
            # Get next payment milestone (next PENDING milestone, ordered by due_date)
            next_milestone = project.milestones.filter(
                status='PENDING'
            ).order_by('due_date').first()
            
            escrow_data.append({
                'project': {
                    'id': project.id,
                    'title': project.title,
                    'location': project.location,
                    'status': project.status,
                    'budget': str(project.budget),
                },
                'budget': str(project.budget),
                'total_paid': str(total_paid),
                'remaining_balance': str(remaining_balance),
                'next_payment': {
                    'milestone_id': next_milestone.id if next_milestone else None,
                    'milestone_name': next_milestone.name if next_milestone else None,
                    'amount': str(next_milestone.amount) if next_milestone else None,
                    'due_date': next_milestone.due_date.isoformat() if next_milestone else None,
                    'status': next_milestone.status if next_milestone else None,
                } if next_milestone else None,
            })
        
        return Response({
            'projects': escrow_data,
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

class PaymentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for creating and managing milestone payments
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuilder]

    def get_queryset(self):
        queryset = Payment.objects.filter(project__owner=self.request.user)
        # Filter by project if provided
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        milestone_id = self.request.data.get('milestone')
        project_id = self.request.data.get('project')
        
        try:
            milestone = Milestone.objects.get(id=milestone_id, project__owner=self.request.user)
            project = Project.objects.get(id=project_id, owner=self.request.user)
        except (Milestone.DoesNotExist, Project.DoesNotExist):
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Milestone or project not found or you do not have permission.')
        
        # Create payment
        payment = serializer.save(
            milestone=milestone,
            project=project,
            status='COMPLETED',
            paid_at=timezone.now()
        )
        
        # Update milestone status to PAID
        milestone.status = 'PAID'
        milestone.save()
        
        return payment
