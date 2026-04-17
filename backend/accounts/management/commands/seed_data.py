from django.core.management.base import BaseCommand
from accounts.models import AccountType, Account


class Command(BaseCommand):
    help = "Seed default account types and accounts"

    def handle(self, *args, **kwargs):
        # Create Account Types
        types = {
            "Asset": None,
            "Liability": None,
            "Income": None,
            "Expense": None,
        }

        for name in types:
            obj, _ = AccountType.objects.get_or_create(name=name)
            types[name] = obj

        # Create Default Accounts
        default_accounts = [
            {"name": "Cash", "role": "CASH", "type": "Asset"},
            {"name": "Bank", "role": "BANK", "type": "Asset"},
            {"name": "Sales", "role": "SALES", "type": "Income"},
            {"name": "Purchase", "role": "PURCHASE", "type": "Expense"},
        ]

        for acc in default_accounts:
            Account.objects.get_or_create(
                name=acc["name"],
                defaults={
                    "role": acc["role"],
                    "account_type": types[acc["type"]],
                },
            )

        self.stdout.write(self.style.SUCCESS("✅ Default data created"))