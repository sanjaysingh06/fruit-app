from django.contrib import admin
from .models import AccountType, Account

admin.site.register(AccountType)
admin.site.register(Account)