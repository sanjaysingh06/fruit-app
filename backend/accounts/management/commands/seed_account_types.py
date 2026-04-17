from django.core.management.base import BaseCommand
from accounts.models import AccountType


class Command(BaseCommand):
    help = 'Seed default account types'

    def handle(self, *args, **kwargs):
        types = ['Asset', 'Liability', 'Income', 'Expense']

        for t in types:
            AccountType.objects.get_or_create(name=t)

        self.stdout.write(self.style.SUCCESS('Account types created'))