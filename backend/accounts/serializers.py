from rest_framework import serializers
from .models import AccountType, Account


class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = '__all__'


class AccountSerializer(serializers.ModelSerializer):
    # ✅ Show readable type (optional)
    account_type_name = serializers.CharField(
        source="account_type.name",
        read_only=True
    )

    class Meta:
        model = Account
        fields = '__all__'
        extra_kwargs = {
            'account_type': {'read_only': True}  # 🔥 hide from input
        }