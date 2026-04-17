from django.db import models
from accounts.models import Account


class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('SALE', 'Sale'),
        ('PURCHASE', 'Purchase'),
        ('PAYMENT', 'Payment'),
        ('RECEIPT', 'Receipt'),
        ('JOURNAL', 'Journal'),
    ]

    date = models.DateField(db_index=True)
    reference = models.CharField(max_length=100, blank=True, null=True)

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES,
        db_index=True
    )

    narration = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.id}"


class TransactionEntry(models.Model):
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='entries'
    )

    account = models.ForeignKey(Account, on_delete=models.PROTECT, db_index=True)

    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.account} - D:{self.debit} C:{self.credit}"


class TransactionItem(models.Model):
    CALCULATION_TYPE = [
        ('WEIGHT', 'Weight'),
        ('QUANTITY', 'Quantity'),
        ('DIRECT', 'Direct'),
    ]

    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='items'
    )

    item_name = models.CharField(max_length=100)

    quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    calculation_type = models.CharField(max_length=20, choices=CALCULATION_TYPE)

    def __str__(self):
        return f"{self.item_name} - {self.amount}"
    
class CrateTransaction(models.Model):
    TRANSACTION_TYPE = [
        ('GIVEN', 'Given'),
        ('RECEIVED', 'Received'),
    ]

    date = models.DateField()

    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE)

    quantity = models.IntegerField()

    reference = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.account} - {self.transaction_type} - {self.quantity}"