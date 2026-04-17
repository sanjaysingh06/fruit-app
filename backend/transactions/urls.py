from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransactionViewSet,
    account_ledger,
    account_outstanding,
    account_summary,
    all_accounts_outstanding,
    crate_ledger, 
    crate_outstanding,
    dashboard_summary
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('ledger/<int:account_id>/', account_ledger),
    path('outstanding/<int:account_id>/', account_outstanding),
    path('summary/<int:account_id>/', account_summary),
    path('all-outstanding/', all_accounts_outstanding),
    path('crate-ledger/<int:account_id>/', crate_ledger),
    path('crate-outstanding/<int:account_id>/', crate_outstanding),
    path('dashboard-summary/', dashboard_summary),
]