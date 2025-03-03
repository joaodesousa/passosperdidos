from rest_framework import viewsets, status
from .models import ProjetoLei, Phase, Author, Vote
from .serializers import ProjetoLeiSerializer, AuthorSerializer
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
from datetime import datetime, timedelta
from django.core.cache import cache
from django.utils import timezone

class DashboardStatisticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        # Try to get from cache first (update every 6 hours)
        cache_key = 'dashboard_statistics'
        cached_stats = cache.get(cache_key)
        
        if cached_stats:
            return Response(cached_stats)
        
        # Calculate statistics from database
        stats = {}
        
        # Total number of proposals
        stats['total_proposals'] = ProjetoLei.objects.count()
        
        # Total number of vote events
        stats['total_votes'] = Vote.objects.count()
        
        # Proposals this year
        current_year = timezone.now().year
        stats['proposals_this_year'] = ProjetoLei.objects.filter(
            date__year=current_year
        ).count()
        
        # Party statistics
        party_stats = {}
        for author in Author.objects.filter(author_type='Grupo'):
            party_stats[author.name] = ProjetoLei.objects.filter(authors__name=author.name).count()
        
        stats['proposals_by_party'] = party_stats
        
        # Recent votes
        stats['recent_votes'] = Vote.objects.filter(
            date__gte=timezone.now().date() - timedelta(days=30)
        ).count()
        
        # Proposals in the last 30 days
        stats['recent_proposals'] = ProjetoLei.objects.filter(
            date__gte=timezone.now().date() - timedelta(days=30)
        ).count()
        
        # Cache results for 6 hours
        cache.set(cache_key, stats, 6 * 60 * 60)
        
        return Response(stats)

class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    
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
    permission_classes = [IsAuthenticatedOrReadOnly]

    queryset = ProjetoLei.objects.all().order_by('-date')
    serializer_class = ProjetoLeiSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'external_id']

    def get_queryset(self):
        queryset = super().get_queryset()
        type_param = self.request.query_params.get('type', None)
        if type_param:
            type_param = type_param.split(',')
            queryset = queryset.filter(type__in=type_param)

        start_date_param = self.request.query_params.get('start_date', None)
        end_date_param = self.request.query_params.get('end_date', None)

        author_param = self.request.query_params.get('authors', None)
        if author_param:
            author_names = author_param.split(',')  # Support multiple authors
            queryset = queryset.filter(authors__name__in=author_names)  # Exact match for authors
        print("Author filter param:", author_param)

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
        id_param = self.request.query_params.get('external_id', None)
        if id_param:
            id_param = id_param.split(',')
            queryset = queryset.filter(external_id__in=id_param)

        return queryset
