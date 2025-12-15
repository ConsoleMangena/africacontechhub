from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import SubscriptionPlan, Subscription, PaymentMethod, Invoice
from .serializers import (
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
    PaymentMethodSerializer,
    InvoiceSerializer
)


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing subscription plans
    """
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated]


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user subscriptions
    """
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            current_period_end=timezone.now() + timedelta(days=30)
        )
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the user's current subscription"""
        try:
            subscription = Subscription.objects.get(user=request.user, status='ACTIVE')
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except Subscription.DoesNotExist:
            # Create a free subscription if none exists
            free_plan = SubscriptionPlan.objects.get(name='FREE')
            subscription = Subscription.objects.create(
                user=request.user,
                plan=free_plan,
                current_period_end=timezone.now() + timedelta(days=365)
            )
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a subscription at period end"""
        subscription = self.get_object()
        subscription.cancel_at_period_end = True
        subscription.cancelled_at = timezone.now()
        subscription.save()
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """Reactivate a cancelled subscription"""
        subscription = self.get_object()
        subscription.cancel_at_period_end = False
        subscription.cancelled_at = None
        subscription.save()
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upgrade(self, request, pk=None):
        """Upgrade to a different plan"""
        subscription = self.get_object()
        new_plan_id = request.data.get('plan_id')
        
        try:
            new_plan = SubscriptionPlan.objects.get(id=new_plan_id)
            subscription.plan = new_plan
            subscription.save()
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except SubscriptionPlan.DoesNotExist:
            return Response(
                {'error': 'Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing payment methods
    """
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # If this is set as default, unset other default payment methods
        if serializer.validated_data.get('is_default', False):
            PaymentMethod.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set a payment method as default"""
        payment_method = self.get_object()
        PaymentMethod.objects.filter(user=request.user, is_default=True).update(is_default=False)
        payment_method.is_default = True
        payment_method.save()
        serializer = self.get_serializer(payment_method)
        return Response(serializer.data)


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing invoices
    """
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Invoice.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Get download URL for invoice PDF"""
        invoice = self.get_object()
        if invoice.invoice_pdf_url:
            return Response({'download_url': invoice.invoice_pdf_url})
        else:
            return Response(
                {'error': 'PDF not available'},
                status=status.HTTP_404_NOT_FOUND
            )
