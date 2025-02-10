from rest_framework import viewsets, status
from .models import ProjetoLei
from .serializers import ProjetoLeiSerializer
from .pagination import CustomPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend


class CustomAPIKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):
        api_key = request.headers.get("X-API-KEY")
        if api_key != settings.API_SECRET_KEY:
            raise AuthenticationFailed("Invalid API Key")
        return None  # Allow the request to continue

class TypeListView(APIView):
    def get(self, request):
        types = ProjetoLei.objects.values_list('type', flat=True).distinct()
        return Response(list(types))
    
class PhaseListView(APIView):
    def get(self, request):
        types = ProjetoLei.objects.values_list('phase', flat=True).distinct()
        return Response(list(types))

from datetime import datetime

class ProjetoLeiViewSet(ReadOnlyModelViewSet):
    queryset = ProjetoLei.objects.all().order_by('-date')
    serializer_class = ProjetoLeiSerializer
    authentication_classes = [CustomAPIKeyAuthentication]  # Use custom auth
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['title']

    def get_queryset(self):
        queryset = super().get_queryset()
        type_param = self.request.query_params.get('type', None)
        phase_param = self.request.query_params.get('phase', None)
        start_date_param = self.request.query_params.get('start_date', None)
        end_date_param = self.request.query_params.get('end_date', None)

        if type_param:
            queryset = queryset.filter(type=type_param)
        
        if phase_param:
            queryset = queryset.filter(phase=phase_param)
        
        # Handle start_date filter
        if start_date_param:
            try:
                start_date = datetime.strptime(start_date_param, '%Y-%m-%d')  # Adjust date format if needed
                queryset = queryset.filter(date__gte=start_date)
            except ValueError:
                pass  # Handle invalid date format if needed
        
        # Handle end_date filter
        if end_date_param:
            try:
                end_date = datetime.strptime(end_date_param, '%Y-%m-%d')  # Adjust date format if needed
                queryset = queryset.filter(date__lte=end_date)
            except ValueError:
                pass  # Handle invalid date format if needed

        return queryset
