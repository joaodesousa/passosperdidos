from rest_framework import viewsets, status
from .models import ProjetoLei, Phase
from .serializers import ProjetoLeiSerializer
from .pagination import CustomPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.filters import SearchFilter
from rest_framework_simplejwt.authentication import JWTAuthentication
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Subquery, OuterRef
from datetime import datetime

class AuthorListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        types = ProjetoLei.objects.values_list('authors__name', flat=True).distinct()
        return Response(list(types))
    
class TypeListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        types = ProjetoLei.objects.values_list('type', flat=True).distinct()
        return Response(list(types))


class PhaseListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        types = Phase.objects.values_list('name', flat=True).distinct().order_by('name')
        return Response(list(types))


class ProjetoLeiViewSet(ReadOnlyModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = ProjetoLei.objects.all().order_by('-date')
    serializer_class = ProjetoLeiSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'id']

    def get_queryset(self):
        queryset = super().get_queryset()
        type_param = self.request.query_params.get('type', None)
        if type_param:
            type_param = type_param.split(',')
            queryset = queryset.filter(type__in=type_param)

        start_date_param = self.request.query_params.get('start_date', None)
        end_date_param = self.request.query_params.get('end_date', None)

        # Handle author filter
        author_param = self.request.query_params.get('author', None)
        if author_param:
            queryset = queryset.filter(author__exact=author_param)

        # Handle phase filter
        phase_param = self.request.query_params.get('phase', None)
        if phase_param:
            phase_ids = Phase.objects.filter(name=phase_param).values_list('id', flat=True)
            if phase_ids:
                last_phase_subquery = ProjetoLei.objects.annotate(
                    last_phase_id=Subquery(
                        Phase.objects.filter(projetos_lei=OuterRef('id'))
                        .order_by('-id')
                        .values('id')[:1]
                    )
                ).filter(last_phase_id__in=phase_ids)

                queryset = queryset.filter(id__in=last_phase_subquery.values('id'))
            else:
                queryset = queryset.none()

        # Handle start_date filter
        if start_date_param:
            try:
                start_date = datetime.strptime(start_date_param, '%Y-%m-%d')
                queryset = queryset.filter(date__gte=start_date)
            except ValueError:
                pass

        # Handle end_date filter
        if end_date_param:
            try:
                end_date = datetime.strptime(end_date_param, '%Y-%m-%d')
                queryset = queryset.filter(date__lte=end_date)
            except ValueError:
                pass

        # Handle id filter
        id_param = self.request.query_params.get('id', None)
        if id_param:
            id_param = id_param.split(',')
            queryset = queryset.filter(id__in=id_param)

        return queryset
