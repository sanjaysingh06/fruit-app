from django.db import models


class AccountType(models.Model):
    name = models.CharField(max_length=50)  # Asset, Liability, Income, Expense

    def __str__(self):
        return self.name


class Account(models.Model):
    name = models.CharField(max_length=100)

    # ✅ KEEP (hidden from UI)
    account_type = models.ForeignKey(
        AccountType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    # ✅ NEW (main field for UI)
    role = models.CharField(
        max_length=20,
        choices=[
            ('CUSTOMER', 'Customer'),
            ('VENDOR', 'Vendor'),
            ('CASH', 'Cash'),
            ('BANK', 'Bank'),
            ('SALES', 'Sales'),
            ('PURCHASE', 'Purchase'),
        ],
        blank=True,
        null=True
    )

    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        """
        Auto assign account_type based on role
        """
        role_type_map = {
            'CUSTOMER': 'Asset',
            'VENDOR': 'Liability',
            'CASH': 'Asset',
            'BANK': 'Asset',
            'SALES': 'Income',
            'PURCHASE': 'Expense',
        }

        if self.role:
            type_name = role_type_map.get(self.role)

            if type_name:
                account_type_obj = AccountType.objects.filter(name=type_name).first()
                if account_type_obj:
                    self.account_type = account_type_obj

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name