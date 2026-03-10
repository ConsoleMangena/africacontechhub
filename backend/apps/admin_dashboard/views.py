from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework import status
from apps.authentication.models import Profile, AccountRequest
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from apps.builder_dashboard.models import Project
from apps.contractor_dashboard.models import Bid
from apps.supplier_dashboard.models import MaterialOrder


class IsAdminRole(BasePermission):
    """Only allow users with ADMIN role on their profile."""
    def has_permission(self, request, view):
        profile = getattr(request.user, 'profile', None)
        return profile is not None and profile.role == 'ADMIN'


class AdminUserManagementView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        users_data = []
        for user in User.objects.all().select_related('profile'):
            profile = getattr(user, 'profile', None)
            users_data.append({
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined,
                'role': profile.role if profile else 'BUILDER',
                'is_active': user.is_active,
                'is_approved': profile.is_approved if profile else False,
            })
        return Response(users_data)

    def patch(self, request, pk=None):
        if not pk:
            return Response({'error': 'User ID required'}, status=400)
        try:
            user = User.objects.get(pk=pk)
            role = request.data.get('role')
            is_active = request.data.get('is_active')
            is_approved = request.data.get('is_approved')

            if role or is_approved is not None:
                profile, _ = Profile.objects.get_or_create(user=user)
                if role:
                    profile.role = role
                if is_approved is not None:
                    profile.is_approved = is_approved
                profile.save()

            if is_active is not None:
                user.is_active = is_active
                user.save()

            return Response({'success': True})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    def delete(self, request, pk=None):
        if not pk:
            return Response({'error': 'User ID required'}, status=400)
        if request.user.pk == pk:
            return Response(
                {'error': 'You cannot delete your own account'},
                status=400
            )
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response({'success': True})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Exception as e:
            return Response(
                {'error': f'Failed to delete user: {str(e)}'},
                status=500
            )


class SystemMetricsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        total_users = User.objects.count()
        active_projects = Project.objects.filter(status='ACTIVE').count()
        active_suppliers = Profile.objects.filter(role='SUPPLIER').count()
        
        # Calculate Volume from Accepted Bids and Delivered Orders
        bids_volume = sum(float(bid.total_amount) for bid in Bid.objects.filter(status='ACCEPTED'))
        orders_volume = sum(float(order.total_cost) for order in MaterialOrder.objects.filter(status='DELIVERED') if order.total_cost)
        total_volume = bids_volume + orders_volume

        return Response({
            'total_users': total_users,
            'active_projects': active_projects,
            'active_suppliers': active_suppliers,
            'total_volume': total_volume,
        })


class AccountRequestView(APIView):
    """
    GET  /api/v1/admin/requests/         - List all account requests (admin only)
    POST /api/v1/admin/requests/         - Submit a new account request (any authenticated user)
    PATCH /api/v1/admin/requests/<pk>/   - Approve or reject a request (admin only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests = AccountRequest.objects.select_related('user', 'reviewed_by').all()
        data = []
        for req in requests:
            data.append({
                'id': req.id,
                'user_id': req.user.id,
                'email': req.user.email,
                'first_name': req.user.first_name,
                'last_name': req.user.last_name,
                'requested_role': req.requested_role,
                'status': req.status,
                'created_at': req.created_at,
                'reviewed_at': req.reviewed_at,
                'reviewed_by': req.reviewed_by.email if req.reviewed_by else None,
                'notes': req.notes,
            })
        return Response(data)

    def post(self, request):
        """Create an account request for the current user."""
        user = request.user
        requested_role = request.data.get('role', 'BUILDER')

        # Idempotent: only one request per user
        existing = AccountRequest.objects.filter(user=user).first()
        if existing:
            return Response({
                'id': existing.id,
                'status': existing.status,
                'message': 'Account request already exists.',
            }, status=200)

        account_request = AccountRequest.objects.create(
            user=user,
            requested_role=requested_role,
        )
        return Response({
            'id': account_request.id,
            'status': account_request.status,
            'message': 'Account request submitted successfully.',
        }, status=201)

    def patch(self, request, pk=None):
        """Approve or reject an account request (admin action)."""
        if not pk:
            return Response({'error': 'Request ID required'}, status=400)

        action = request.data.get('action')  # 'approve' or 'reject'
        notes = request.data.get('notes', '')

        if action not in ('approve', 'reject'):
            return Response({'error': "action must be 'approve' or 'reject'"}, status=400)

        try:
            account_request = AccountRequest.objects.select_related('user').get(pk=pk)
        except AccountRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=404)

        account_request.reviewed_at = timezone.now()
        account_request.reviewed_by = request.user
        account_request.notes = notes

        if action == 'approve':
            account_request.status = 'APPROVED'
            account_request.save()
            # Grant access
            profile, _ = Profile.objects.get_or_create(user=account_request.user)
            profile.is_approved = True
            profile.role = account_request.requested_role
            profile.save()
            return Response({'success': True, 'status': 'APPROVED'})
        else:
            account_request.status = 'REJECTED'
            account_request.save()
            # Ensure is_approved stays False
            profile, _ = Profile.objects.get_or_create(user=account_request.user)
            profile.is_approved = False
            profile.save()
            return Response({'success': True, 'status': 'REJECTED'})


class AIAnalyticsView(APIView):
    """
    GET /api/v1/admin/ai-analytics/
    Returns comprehensive AI usage metrics for the admin dashboard:
    - messages per day (last 30 days)
    - total tokens consumed + estimated cost
    - popular commands / endpoints
    - average feedback rating
    - BOQ template stats
    - model performance breakdown
    - analyse command stats
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        from datetime import timedelta
        from apps.ai_architecture.models import (
            ChatMessage, ChatSession, TokenUsage, ImageFeedback,
            BOQTemplate, MaterialPrice, KnowledgeDocument, DrawingStylePreset,
        )

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)

        # ── Messages per day (last 30 days) ──
        messages_per_day = (
            ChatMessage.objects
            .filter(created_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        # ── Token usage summary ──
        token_summary = TokenUsage.objects.filter(
            created_at__gte=thirty_days_ago
        ).aggregate(
            total_input=Sum('input_tokens'),
            total_output=Sum('output_tokens'),
            total_tokens=Sum('total_tokens'),
            request_count=Count('id'),
        )

        # ── Estimated cost (Claude pricing: ~$3/M input, ~$15/M output) ──
        input_cost = ((token_summary['total_input'] or 0) / 1_000_000) * 3.0
        output_cost = ((token_summary['total_output'] or 0) / 1_000_000) * 15.0
        estimated_cost = round(input_cost + output_cost, 2)

        # ── 7-day vs 30-day comparison ──
        tokens_7d = TokenUsage.objects.filter(
            created_at__gte=seven_days_ago
        ).aggregate(total=Sum('total_tokens'), count=Count('id'))

        # ── Popular endpoints ──
        endpoint_breakdown = (
            TokenUsage.objects
            .filter(created_at__gte=thirty_days_ago)
            .values('endpoint')
            .annotate(count=Count('id'), tokens=Sum('total_tokens'))
            .order_by('-count')
        )

        # ── Top users by tokens ──
        top_users = (
            TokenUsage.objects
            .filter(created_at__gte=thirty_days_ago)
            .values('user__username', 'user__email')
            .annotate(total=Sum('total_tokens'), requests=Count('id'))
            .order_by('-total')[:10]
        )

        # ── Image feedback stats ──
        feedback_stats = {'avg_rating': 0, 'total_feedback': 0}
        if ImageFeedback.objects.exists():
            from django.db.models import Avg
            feedback_stats = ImageFeedback.objects.aggregate(
                avg_rating=Avg('rating'),
                total_feedback=Count('id'),
            )

        # ── Session count ──
        total_sessions = ChatSession.objects.count()
        active_sessions_30d = ChatSession.objects.filter(
            updated_at__gte=thirty_days_ago
        ).count()

        # ── BOQ Template stats ──
        boq_templates_count = BOQTemplate.objects.count()
        active_boq_template = BOQTemplate.objects.filter(is_active=True).first()
        boq_template_info = None
        if active_boq_template:
            boq_template_info = {
                'id': active_boq_template.id,
                'name': active_boq_template.name,
                'include_labour_rate': active_boq_template.include_labour_rate,
                'include_measurement_formula': active_boq_template.include_measurement_formula,
                'example_items_count': len(active_boq_template.get_example_items()),
                'updated_at': active_boq_template.updated_at.isoformat() if active_boq_template.updated_at else None,
            }

        # ── Training data summary ──
        training_data = {
            'knowledge_documents': KnowledgeDocument.objects.count(),
            'embedded_documents': KnowledgeDocument.objects.filter(is_embedded=True).count(),
            'material_prices': MaterialPrice.objects.count(),
            'material_regions': list(
                MaterialPrice.objects.values_list('region', flat=True).distinct()[:10]
            ),
            'style_presets': DrawingStylePreset.objects.count(),
            'active_presets': DrawingStylePreset.objects.filter(is_active=True).count(),
        }

        # ── Analyse command usage (last 30 days) ──
        analyse_usage = TokenUsage.objects.filter(
            endpoint='analyse', created_at__gte=thirty_days_ago
        ).aggregate(
            count=Count('id'),
            tokens=Sum('total_tokens'),
        )

        # ── Model usage breakdown ──
        model_breakdown = (
            TokenUsage.objects
            .filter(created_at__gte=thirty_days_ago)
            .values('model_name')
            .annotate(count=Count('id'), tokens=Sum('total_tokens'))
            .order_by('-tokens')
        )

        # ── Messages by role (user vs assistant) ──
        messages_by_role = (
            ChatMessage.objects
            .filter(created_at__gte=thirty_days_ago)
            .values('role')
            .annotate(count=Count('id'))
        )

        return Response({
            'messages_per_day': list(messages_per_day),
            'token_summary': {
                'total_input': token_summary['total_input'] or 0,
                'total_output': token_summary['total_output'] or 0,
                'total_tokens': token_summary['total_tokens'] or 0,
                'request_count': token_summary['request_count'] or 0,
                'estimated_cost_usd': estimated_cost,
            },
            'tokens_7d': {
                'total': tokens_7d['total'] or 0,
                'count': tokens_7d['count'] or 0,
            },
            'endpoint_breakdown': list(endpoint_breakdown),
            'top_users': list(top_users),
            'feedback': {
                'avg_rating': round(float(feedback_stats.get('avg_rating') or 0), 2),
                'total_feedback': feedback_stats.get('total_feedback', 0),
            },
            'sessions': {
                'total': total_sessions,
                'active_30d': active_sessions_30d,
            },
            'boq_templates': {
                'total': boq_templates_count,
                'active_template': boq_template_info,
            },
            'training_data': training_data,
            'analyse_usage': {
                'count_30d': analyse_usage['count'] or 0,
                'tokens_30d': analyse_usage['tokens'] or 0,
            },
            'model_breakdown': list(model_breakdown),
            'messages_by_role': list(messages_by_role),
        })
