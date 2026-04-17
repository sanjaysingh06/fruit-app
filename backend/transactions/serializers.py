from rest_framework import serializers
from .models import Transaction, TransactionEntry, TransactionItem


# ===============================
# ENTRY SERIALIZER
# ===============================
class TransactionEntrySerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_role = serializers.CharField(source='account.role', read_only=True)

    class Meta:
        model = TransactionEntry
        fields = ['account', 'account_name', 'account_role', 'debit', 'credit']


# ===============================
# ITEM SERIALIZER
# ===============================
class TransactionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionItem
        fields = [
            'item_name',
            'quantity',
            'weight',
            'rate',
            'amount',
            'calculation_type'
        ]


# ===============================
# MAIN SERIALIZER
# ===============================
class TransactionSerializer(serializers.ModelSerializer):
    entries = TransactionEntrySerializer(many=True)
    items = TransactionItemSerializer(many=True, required=False)

    # 🔥 NEW FIELDS
    party_name = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    paid_amount = serializers.SerializerMethodField()
    due_amount = serializers.SerializerMethodField()
    payment_mode = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id',
            'date',
            'transaction_type',
            'reference',
            'narration',

            # 🔥 computed fields
            'party_name',
            'total_amount',
            'paid_amount',
            'due_amount',
            'payment_mode',

            # original
            'entries',
            'items'
        ]

    # ===============================
    # 🧠 COMPUTED LOGIC
    # ===============================

    def get_party_name(self, obj):
        entry = next(
            (e for e in obj.entries.all()
             if e.account.role in ['CUSTOMER', 'VENDOR']),
            None
        )
        return entry.account.name if entry else None

    def get_total_amount(self, obj):
        return sum([item.amount for item in obj.items.all()])

    def get_paid_amount(self, obj):
        return sum([
            e.debit for e in obj.entries.all()
            if e.account.role in ['CASH', 'BANK']
        ])

    def get_due_amount(self, obj):
        total = self.get_total_amount(obj)
        paid = self.get_paid_amount(obj)
        return total - paid

    def get_payment_mode(self, obj):
        entry = next(
            (e for e in obj.entries.all()
             if e.account.role in ['CASH', 'BANK']),
            None
        )
        return entry.account.role if entry else None

    # ===============================
    # VALIDATION
    # ===============================
    def validate(self, data):
        entries = data.get('entries')

        total_debit = sum([e.get('debit', 0) for e in entries])
        total_credit = sum([e.get('credit', 0) for e in entries])

        if total_debit != total_credit:
            raise serializers.ValidationError("Debit and Credit must be equal")

        return data

    # ===============================
    # CREATE
    # ===============================
    def create(self, validated_data):
        entries_data = validated_data.pop('entries')
        items_data = validated_data.pop('items', [])

        transaction = Transaction.objects.create(**validated_data)

        for entry in entries_data:
            TransactionEntry.objects.create(transaction=transaction, **entry)

        for item in items_data:
            TransactionItem.objects.create(transaction=transaction, **item)

        return transaction
    
    def update(self, instance, validated_data):
        entries_data = validated_data.pop('entries')
        items_data = validated_data.pop('items', [])

        # Update main fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Delete old
        instance.entries.all().delete()
        instance.items.all().delete()

        # Recreate entries
        for entry in entries_data:
            TransactionEntry.objects.create(transaction=instance, **entry)

        # Recreate items
        for item in items_data:
            TransactionItem.objects.create(transaction=instance, **item)

        return instance