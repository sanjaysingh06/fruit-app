from rest_framework import viewsets
from .models import AccountType, Account
from .serializers import AccountTypeSerializer, AccountSerializer
from rest_framework.permissions import IsAuthenticated


class AccountTypeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = AccountType.objects.all()
    serializer_class = AccountTypeSerializer


class AccountViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Account.objects.all()
    serializer_class = AccountSerializer