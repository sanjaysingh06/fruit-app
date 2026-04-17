from rest_framework import viewsets
from .models import Transaction, TransactionEntry, CrateTransaction
from .serializers import TransactionSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response

from accounts.models import Account

from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated


class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Transaction.objects.all().order_by('-date')
    serializer_class = TransactionSerializer

@api_view(['GET'])
def account_ledger(request, account_id):
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    txn_type = request.GET.get('type')

    from accounts.models import Account

    account = Account.objects.get(id=account_id)

    # 🔥 START WITH OPENING BALANCE
    balance = account.opening_balance

    entries = TransactionEntry.objects.filter(
        account_id=account_id
    ).select_related('transaction')

    if from_date:
        entries = entries.filter(transaction__date__gte=from_date)

    if to_date:
        entries = entries.filter(transaction__date__lte=to_date)

    if txn_type:
        entries = entries.filter(transaction__transaction_type=txn_type)

    entries = entries.order_by('transaction__date', 'id')

    ledger = []

    # 🔥 ADD OPENING ROW
    ledger.append({
        "date": "",
        "transaction_type": "OPENING",
        "reference": "",
        "debit": 0,
        "credit": 0,
        "balance": balance
    })

    for entry in entries:
        balance += entry.debit
        balance -= entry.credit

        ledger.append({
            "date": entry.transaction.date,
            "transaction_type": entry.transaction.transaction_type,
            "reference": entry.transaction.reference,
            "debit": entry.debit,
            "credit": entry.credit,
            "balance": balance
        })

    return Response(ledger)

@api_view(['GET'])
def account_outstanding(request, account_id):
    totals = TransactionEntry.objects.filter(
        account_id=account_id
    ).aggregate(
        total_debit=Sum('debit'),
        total_credit=Sum('credit')
    )

    total_debit = totals['total_debit'] or 0
    total_credit = totals['total_credit'] or 0

    balance = total_debit - total_credit

    return Response({
        "account_id": account_id,
        "total_debit": total_debit,
        "total_credit": total_credit,
        "outstanding": balance
    })

@api_view(['GET'])
def account_summary(request, account_id):
    from accounts.models import Account

    account = Account.objects.get(id=account_id)

    totals = TransactionEntry.objects.filter(
        account_id=account_id
    ).aggregate(
        total_debit=Sum('debit'),
        total_credit=Sum('credit')
    )

    total_debit = totals['total_debit'] or 0
    total_credit = totals['total_credit'] or 0

    # 🔥 INCLUDE OPENING BALANCE
    balance = account.opening_balance + total_debit - total_credit

    return Response({
        "account_id": account_id,
        "total_debit": total_debit,
        "total_credit": total_credit,
        "balance": balance
    })

@api_view(['GET'])
def all_accounts_outstanding(request):
    from accounts.models import Account

    data = []

    accounts = Account.objects.all()

    for acc in accounts:
        totals = TransactionEntry.objects.filter(
            account=acc
        ).aggregate(
            total_debit=Sum('debit'),
            total_credit=Sum('credit')
        )

        total_debit = totals['total_debit'] or 0
        total_credit = totals['total_credit'] or 0

        balance = total_debit - total_credit

        data.append({
            "account_id": acc.id,
            "account_name": acc.name,
            "balance": balance
        })

    return Response(data)

@api_view(['GET'])
def crate_ledger(request, account_id):
    entries = CrateTransaction.objects.filter(
        account_id=account_id
    ).order_by('date')

    balance = 0
    ledger = []

    for entry in entries:
        if entry.transaction_type == 'GIVEN':
            balance += entry.quantity
        else:
            balance -= entry.quantity

        ledger.append({
            "date": entry.date,
            "type": entry.transaction_type,
            "quantity": entry.quantity,
            "balance": balance
        })

    return Response(ledger)

from django.db.models import Sum

@api_view(['GET'])
def crate_outstanding(request, account_id):
    given = CrateTransaction.objects.filter(
        account_id=account_id,
        transaction_type='GIVEN'
    ).aggregate(total=Sum('quantity'))['total'] or 0

    received = CrateTransaction.objects.filter(
        account_id=account_id,
        transaction_type='RECEIVED'
    ).aggregate(total=Sum('quantity'))['total'] or 0

    balance = given - received

    return Response({
        "account_id": account_id,
        "given": given,
        "received": received,
        "pending_crates": balance
    })


@api_view(['GET'])
def dashboard_summary(request):

    sales = TransactionEntry.objects.filter(
        account__role="SALES"
    ).aggregate(total=Sum('credit'))['total'] or 0

    purchase = TransactionEntry.objects.filter(
        account__role="PURCHASE"
    ).aggregate(total=Sum('debit'))['total'] or 0

    outstanding = TransactionEntry.objects.aggregate(
        total=Sum('debit') - Sum('credit')
    )['total'] or 0

    cash_accounts = Account.objects.filter(role__in=["CASH", "BANK"])

    cash_balance = TransactionEntry.objects.filter(
        account__in=cash_accounts
    ).aggregate(total=Sum('debit') - Sum('credit'))['total'] or 0

    return Response({
        "sales": sales,
        "purchase": purchase,
        "outstanding": outstanding,
        "cash": cash_balance
    })