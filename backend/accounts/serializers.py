from rest_framework import serializers
from django.db.models import Sum

from .models import AccountType, Account
from transactions.models import TransactionEntry


class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = "__all__"


class AccountSerializer(serializers.ModelSerializer):
    # Show readable account type
    account_type_name = serializers.CharField(
        source="account_type.name",
        read_only=True
    )

    # Closing Balance
    closing_balance = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = "__all__"
        extra_kwargs = {
            "account_type": {"read_only": True}
        }

    def get_closing_balance(self, obj):
        totals = TransactionEntry.objects.filter(
            account=obj
        ).aggregate(
            total_debit=Sum("debit"),
            total_credit=Sum("credit")
        )

        total_debit = totals["total_debit"] or 0
        total_credit = totals["total_credit"] or 0

        return obj.opening_balance + total_debit - total_credit