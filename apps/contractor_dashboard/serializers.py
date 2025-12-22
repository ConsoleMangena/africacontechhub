from rest_framework import serializers
from .models import ContractorProfile, Bid, WIPAA

class ContractorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractorProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'total_amount')

class WIPAASerializer(serializers.ModelSerializer):
    over_under_billing = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = WIPAA
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
