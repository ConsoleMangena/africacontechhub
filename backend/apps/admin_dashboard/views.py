from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from apps.authentication.models import Profile, AccountRequest
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum, Count, Q, Avg
from django.db.models.functions import TruncDate
from apps.builder_dashboard.models import Project, MaterialRequest
from apps.contractor_dashboard.models import Bid, ProfessionalProfile
from apps.supplier_dashboard.models import MaterialOrder
from .models import (
    FloorPlanCategory, FloorPlanDataset, PlatformSettings,
    AdminActivityLog, log_admin_action,
)


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

    def post(self, request):
        """Allow admins to create users directly."""
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'BUILDER')
        password = request.data.get('password') # Optional, if using Django auth directly

        if not email:
            return Response({'error': 'Email is required'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=400)

        # Create Django User
        # Note: In this system, Supabase usually handles auth, but we create a matching Django user.
        # For admin-created users, we might need to handle Supabase invitation or just create the record.
        # For now, we create the Django user with a random username if no supabase_id is provided.
        import uuid
        username = str(uuid.uuid4())
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        if password:
            user.set_password(password)
            user.save()

        # Create Profile
        Profile.objects.create(
            user=user,
            role=role,
            is_approved=True,
            first_name=first_name,
            last_name=last_name
        )

        log_admin_action(request, 'USER_CREATED', 'User', user.id, email, f'Role: {role}')

        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': role
            }
        }, status=201)

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
                old_role = profile.role
                if role:
                    profile.role = role
                if is_approved is not None:
                    profile.is_approved = is_approved
                profile.save()
                if role and role != old_role:
                    log_admin_action(request, 'USER_ROLE_CHANGED', 'User', user.id, user.email, f'{old_role} → {role}')

            if is_active is not None:
                user.is_active = is_active
                user.save()
                log_admin_action(request, 'USER_TOGGLED', 'User', user.id, user.email, f"{'Activated' if is_active else 'Deactivated'}")

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
            email = user.email
            user.delete()
            log_admin_action(request, 'USER_DELETED', 'User', pk, email)
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
        from datetime import timedelta
        from django.db.models import Avg, Q
        from django.db.models.functions import TruncMonth

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        total_users = User.objects.count()
        active_projects = Project.objects.filter(
            status__in=['ACTIVE', 'IN_PROGRESS']
        ).count()
        active_suppliers = Profile.objects.filter(role='SUPPLIER').count()

        # Calculate Volume from Accepted Bids, Delivered Orders, and Project Budgets
        bids_volume = Bid.objects.filter(status='ACCEPTED').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        orders_volume = MaterialOrder.objects.filter(
            status='DELIVERED'
        ).aggregate(total=Sum('total_cost'))['total'] or 0
        projects_volume = Project.objects.aggregate(
            total=Sum('budget')
        )['total'] or 0
        total_volume = float(bids_volume) + float(orders_volume) + float(projects_volume)

        # ── User distribution by role ──
        role_counts = (
            Profile.objects.values('role')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        user_distribution = [
            {'role': rc['role'], 'count': rc['count']}
            for rc in role_counts
        ]
        # Include users without profiles as BUILDER
        profiled_count = Profile.objects.count()
        if total_users > profiled_count:
            no_profile = total_users - profiled_count
            found_builder = False
            for ud in user_distribution:
                if ud['role'] == 'BUILDER':
                    ud['count'] += no_profile
                    found_builder = True
                    break
            if not found_builder:
                user_distribution.append({'role': 'BUILDER', 'count': no_profile})

        # ── Monthly platform activity (last 6 months) ──
        six_months_ago = now - timedelta(days=180)

        from apps.ai_architecture.models import ChatMessage

        # User signups per month
        signups_monthly = (
            User.objects.filter(date_joined__gte=six_months_ago)
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(total=Count('id'))
            .order_by('month')
        )
        # Projects created per month
        projects_monthly = (
            Project.objects.filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Count('id'))
            .order_by('month')
        )
        # AI messages per month
        messages_monthly = (
            ChatMessage.objects.filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Count('id'))
            .order_by('month')
        )

        # Merge into a single timeline
        volume_map = {}
        for row in signups_monthly:
            key = row['month'].strftime('%Y-%m')
            volume_map.setdefault(key, {'month': key, 'signups': 0, 'projects': 0, 'ai_messages': 0})
            volume_map[key]['signups'] = row['total']
        for row in projects_monthly:
            key = row['month'].strftime('%Y-%m')
            volume_map.setdefault(key, {'month': key, 'signups': 0, 'projects': 0, 'ai_messages': 0})
            volume_map[key]['projects'] = row['total']
        for row in messages_monthly:
            key = row['month'].strftime('%Y-%m')
            volume_map.setdefault(key, {'month': key, 'signups': 0, 'projects': 0, 'ai_messages': 0})
            volume_map[key]['ai_messages'] = row['total']
        monthly_volume = sorted(volume_map.values(), key=lambda x: x['month'])

        # ── System overview metrics ──
        all_projects = Project.objects.all()
        total_projects = all_projects.count()
        avg_budget = all_projects.aggregate(avg=Avg('budget'))['avg'] or 0

        new_users_30d = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        pending_requests = AccountRequest.objects.filter(status='PENDING').count()

        return Response({
            'total_users': total_users,
            'active_projects': active_projects,
            'active_suppliers': active_suppliers,
            'total_volume': total_volume,
            'user_distribution': user_distribution,
            'monthly_volume': monthly_volume,
            'system_overview': {
                'avg_project_budget': round(float(avg_budget), 2),
                'total_projects': total_projects,
                'new_users_30d': new_users_30d,
                'pending_requests': pending_requests,
            },
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
            log_admin_action(request, 'REQUEST_APPROVED', 'AccountRequest', pk, account_request.user.email, f'Role: {account_request.requested_role}')
            return Response({'success': True, 'status': 'APPROVED'})
        else:
            account_request.status = 'REJECTED'
            account_request.save()
            # Ensure is_approved stays False
            profile, _ = Profile.objects.get_or_create(user=account_request.user)
            profile.is_approved = False
            profile.save()
            log_admin_action(request, 'REQUEST_REJECTED', 'AccountRequest', pk, account_request.user.email, notes)
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


# ═══════════════════════════════════════════════════════════════════════
# FLOOR PLAN VIEWS
# ═══════════════════════════════════════════════════════════════════════

class FloorPlanCategoryView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        cats = FloorPlanCategory.objects.all()
        data = [{'id': c.id, 'name': c.name, 'description': c.description or '', 'created_at': c.created_at} for c in cats]
        return Response({'results': data})

    def post(self, request):
        name = request.data.get('name', '').strip()
        desc = request.data.get('description', '')
        if not name:
            return Response({'error': 'Name required'}, status=400)
        cat = FloorPlanCategory.objects.create(name=name, description=desc)
        return Response({'id': cat.id, 'name': cat.name}, status=201)

    def delete(self, request, pk=None):
        if not pk:
            return Response({'error': 'ID required'}, status=400)
        try:
            FloorPlanCategory.objects.get(pk=pk).delete()
            return Response({'success': True})
        except FloorPlanCategory.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


class FloorPlanDatasetView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        plans = FloorPlanDataset.objects.select_related('category').all()
        data = []
        for p in plans:
            img_url = request.build_absolute_uri(p.image.url) if p.image else None
            data.append({
                'id': p.id, 'title': p.title, 'description': p.description or '',
                'image': img_url, 'category': p.category_id,
                'category_name': p.category.name if p.category else '',
                'created_at': p.created_at,
            })
        return Response({'results': data})

    def post(self, request):
        title = request.data.get('title', '').strip()
        category_id = request.data.get('category')
        image = request.FILES.get('image')
        description = request.data.get('description', '')
        if not title or not category_id or not image:
            return Response({'error': 'title, category, and image are required'}, status=400)
        try:
            cat = FloorPlanCategory.objects.get(pk=category_id)
        except FloorPlanCategory.DoesNotExist:
            return Response({'error': 'Category not found'}, status=404)
        plan = FloorPlanDataset.objects.create(
            title=title, description=description, image=image,
            category=cat, uploaded_by=request.user,
        )
        return Response({'id': plan.id, 'title': plan.title}, status=201)

    def delete(self, request, pk=None):
        if not pk:
            return Response({'error': 'ID required'}, status=400)
        try:
            FloorPlanDataset.objects.get(pk=pk).delete()
            return Response({'success': True})
        except FloorPlanDataset.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


# ═══════════════════════════════════════════════════════════════════════
# ADMIN PROJECTS OVERVIEW
# ═══════════════════════════════════════════════════════════════════════

class AdminProjectsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        from datetime import timedelta
        from django.db.models.functions import TruncMonth

        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()

        qs = Project.objects.select_related('owner').all()
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(owner__email__icontains=search) | Q(location__icontains=search))
        if status_filter:
            qs = qs.filter(status=status_filter)

        projects = []
        for p in qs.order_by('-created_at')[:200]:
            projects.append({
                'id': p.id,
                'title': p.title,
                'location': p.location,
                'status': p.status,
                'budget': float(p.budget) if p.budget else 0,
                'owner_email': p.owner.email,
                'owner_name': f"{p.owner.first_name} {p.owner.last_name}".strip() or p.owner.username,
                'created_at': p.created_at,
            })

        # Summary stats
        total = Project.objects.count()
        by_status = dict(Project.objects.values_list('status').annotate(c=Count('id')).values_list('status', 'c'))
        total_budget = Project.objects.aggregate(s=Sum('budget'))['s'] or 0

        return Response({
            'projects': projects,
            'summary': {
                'total': total,
                'by_status': by_status,
                'total_budget': float(total_budget),
            },
        })


# ═══════════════════════════════════════════════════════════════════════
# ADMIN BILLING / SUBSCRIPTIONS
# ═══════════════════════════════════════════════════════════════════════

class AdminBillingView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        from apps.billing.models import SubscriptionPlan, Subscription, Invoice

        plans = list(SubscriptionPlan.objects.all().values('id', 'name', 'display_name', 'price', 'is_active', 'max_projects', 'storage_gb', 'support_level'))
        subscriptions = []
        for sub in Subscription.objects.select_related('user', 'plan').order_by('-created_at')[:200]:
            subscriptions.append({
                'id': sub.id,
                'user_email': sub.user.email,
                'user_name': f"{sub.user.first_name} {sub.user.last_name}".strip() or sub.user.username,
                'plan_name': sub.plan.name,
                'status': sub.status,
                'current_period_start': sub.current_period_start,
                'current_period_end': sub.current_period_end,
                'created_at': sub.created_at,
            })

        invoices = []
        for inv in Invoice.objects.select_related('user', 'subscription__plan').order_by('-created_at')[:100]:
            invoices.append({
                'id': inv.id,
                'user_email': inv.user.email,
                'amount': float(inv.total),
                'status': inv.status,
                'plan_name': inv.subscription.plan.name if inv.subscription else '—',
                'created_at': inv.created_at,
            })

        # Summary
        active_subs = Subscription.objects.filter(status='ACTIVE').count()
        total_revenue = Invoice.objects.filter(status='PAID').aggregate(s=Sum('total'))['s'] or 0

        return Response({
            'plans': plans,
            'subscriptions': subscriptions,
            'invoices': invoices,
            'summary': {
                'active_subscriptions': active_subs,
                'total_revenue': float(total_revenue),
                'total_plans': len(plans),
                'total_invoices': Invoice.objects.count(),
            },
        })


# ═══════════════════════════════════════════════════════════════════════
# PLATFORM SETTINGS
# ═══════════════════════════════════════════════════════════════════════

class PlatformSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        s = PlatformSettings.load()
        return Response({
            'site_name': s.site_name,
            'tagline': s.tagline,
            'support_email': s.support_email,
            'registration_open': s.registration_open,
            'require_approval': s.require_approval,
            'maintenance_mode': s.maintenance_mode,
            'maintenance_message': s.maintenance_message,
            'default_role': s.default_role,
            'max_projects_per_user': s.max_projects_per_user,
            'max_file_upload_mb': s.max_file_upload_mb,
        })

    def patch(self, request):
        s = PlatformSettings.load()
        changed = []
        for field in [
            'site_name', 'tagline', 'support_email', 'registration_open',
            'require_approval', 'maintenance_mode', 'maintenance_message',
            'default_role', 'max_projects_per_user', 'max_file_upload_mb',
        ]:
            if field in request.data:
                old = getattr(s, field)
                new = request.data[field]
                if str(old) != str(new):
                    changed.append(f"{field}: {old} → {new}")
                setattr(s, field, new)
        s.save()
        if changed:
            log_admin_action(request, 'SETTINGS_CHANGED', 'PlatformSettings', 1, 'Platform Settings', '; '.join(changed))
        return Response({'success': True})


# ═══════════════════════════════════════════════════════════════════════
# ACTIVITY LOG
# ═══════════════════════════════════════════════════════════════════════

class AdminActivityLogView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 100)), 500)
        action_filter = request.query_params.get('action', '').strip()

        qs = AdminActivityLog.objects.select_related('actor').all()
        if action_filter:
            qs = qs.filter(action=action_filter)

        logs = []
        for entry in qs[:limit]:
            logs.append({
                'id': entry.id,
                'actor_email': entry.actor.email if entry.actor else '—',
                'actor_name': f"{entry.actor.first_name} {entry.actor.last_name}".strip() if entry.actor else '—',
                'action': entry.action,
                'action_display': entry.get_action_display(),
                'target_type': entry.target_type,
                'target_id': entry.target_id,
                'target_label': entry.target_label,
                'detail': entry.detail,
                'created_at': entry.created_at,
            })
        return Response(logs)


# ═══════════════════════════════════════════════════════════════════════
# ADMIN PROCUREMENT MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════

class AdminProcurementView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        status_filter = request.query_params.get('status')
        category_filter = request.query_params.get('category')
        project_id = request.query_params.get('project')

        qs = MaterialRequest.objects.select_related('project', 'project__owner').all()

        if status_filter:
            qs = qs.filter(status=status_filter)
        if category_filter:
            qs = qs.filter(procurement_category=category_filter)
        if project_id:
            qs = qs.filter(project_id=project_id)

        data = []
        for req in qs.order_by('-created_at')[:500]:
            data.append({
                'id': req.id,
                'project_id': req.project.id,
                'project_title': req.project.title,
                'owner_email': req.project.owner.email,
                'material_name': req.material_name,
                'quantity_requested': float(req.quantity_requested),
                'unit': req.unit,
                'procurement_category': req.procurement_category,
                'procurement_method': req.procurement_method,
                'price_at_request': float(req.price_at_request),
                'total_calculated_cost': float(req.total_calculated_cost),
                'status': req.status,
                'created_at': req.created_at,
            })

        # Summary for Admin
        summary = {
            'total_requests': qs.count(),
            'pending_requests': qs.filter(status='PENDING').count(),
            'total_cost': float(qs.aggregate(s=Sum('total_calculated_cost'))['s'] or 0),
            'by_status': dict(qs.values_list('status').annotate(c=Count('id')).values_list('status', 'c')),
        }

        return Response({
            'requests': data,
            'summary': summary
        })
