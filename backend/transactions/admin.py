from django.contrib import admin
from .models import Transaction, TransactionEntry, TransactionItem, CrateTransaction

admin.site.register(Transaction)
admin.site.register(TransactionEntry)
admin.site.register(TransactionItem)
admin.site.register(CrateTransaction)