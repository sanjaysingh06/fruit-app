from django.db.models.signals import post_migrate
from django.dispatch import receiver
from accounts.models import AccountType, Account


@receiver(post_migrate)
def create_default_data(sender, **kwargs):
    # Only run for your app
    if sender.name != "accounts":
        return

    # Account Types
    types = {}
    for name in ["Asset", "Liability", "Income", "Expense"]:
        obj, _ = AccountType.objects.get_or_create(name=name)
        types[name] = obj

    # Default Accounts
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