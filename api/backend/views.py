from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Subquery, OuterRef, Count, Q, Min
from datetime import datetime, timedelta
from django.core.cache import cache
from django.utils import timezone

from .models import (
    ProjetoLei, Legislature, Phase, Author, Vote, 
    Publication, Commission, Debate
)
from .serializers import (
    ProjetoLeiListSerializer, ProjetoLeiDetailSerializer, ProjetoLeiFullSerializer,
    LegislatureSerializer, PhaseSerializer, AuthorSerializer, VoteSerializer,
    PublicationSerializer, CommissionSerializer, DebateSerializer
)


class DashboardStatisticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

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
        
        # Calculate the recent proposals based on the date of the first phase
        stats['recent_proposals'] = ProjetoLei.objects.annotate(
            first_phase_date=Min('phases__date')  # Annotate with the date of the first phase
        ).filter(
            first_phase_date__gte=timezone.now().date() - timedelta(days=30)  # Filter based on the first phase date
        ).count()
        
        # Most active phases
        stats['phases_count'] = dict(Phase.objects.values('name').annotate(
            count=Count('id')).order_by('-count').values_list('name', 'count')[:10])
        
        # Cache results for 6 hours
        cache.set(cache_key, stats, 6 * 60 * 60)
        
        return Response(stats)


class ProjetoLeiViewSet(ReadOnlyModelViewSet):
    """
    API endpoint for accessing legislative proposals (Projetos de Lei).
    Uses external_id as the lookup field instead of the default primary key.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ProjetoLei.objects.all().order_by('-date')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'legislature__number', 'initiative_number', 'date']
    search_fields = ['title', 'external_id', 'initiative_number']
    ordering_fields = ['date', 'initiative_number', 'title']
    lookup_field = 'external_id'  
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjetoLeiDetailSerializer
        if self.action == 'full_details':
            return ProjetoLeiFullSerializer
        return ProjetoLeiListSerializer
    
    @action(detail=True, methods=['get'])
    def full_details(self, request, external_id=None):
        """
        Get complete details for a projeto de lei, including all relationships.
        """
        projeto = self.get_object()
        serializer = ProjetoLeiFullSerializer(projeto)
        return Response(serializer.data)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Order by external_id only
        queryset = queryset.order_by('-external_id')  # Order by external_id
        
        # Type filter
        type_param = self.request.query_params.get('type', None)
        if type_param:
            type_param = type_param.split(',')
            queryset = queryset.filter(type__in=type_param)

        # Date range filters
        start_date_param = self.request.query_params.get('start_date', None)
        end_date_param = self.request.query_params.get('end_date', None)

        # Author filter
        author_param = self.request.query_params.get('authors', None)
        if author_param:
            author_names = author_param.split(',')  # Support multiple authors
            queryset = queryset.filter(authors__name__in=author_names)  # Exact match for authors

        # Phase filter
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

       
        # Handle date range filters for phases
        start_date_param = self.request.query_params.get('start_date', None)
        end_date_param = self.request.query_params.get('end_date', None)

        phase_date_filters = Q()
        if start_date_param:
            try:
                start_date = datetime.strptime(start_date_param, '%d-%m-%Y')
                phase_date_filters &= Q(phases__date__gte=start_date)
            except ValueError:
                pass

        if end_date_param:
            try:
                end_date = datetime.strptime(end_date_param, '%d-%m-%Y')
                phase_date_filters &= Q(phases__date__lte=end_date)
            except ValueError:
                pass

        if phase_date_filters:
            # Add the name filter to ensure we're looking at the "Entrada" phase
            phase_date_filters &= Q(phases__name="Entrada")
            queryset = queryset.filter(phase_date_filters).distinct()

        # Handle id filter
        id_param = self.request.query_params.get('external_id', None)
        if id_param:
            id_param = id_param.split(',')
            queryset = queryset.filter(external_id__in=id_param)

        return queryset


class LegislatureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for accessing legislatures.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Legislature.objects.all().order_by('-number')
    serializer_class = LegislatureSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['number']
    ordering_fields = ['number', 'start_date']


class PhaseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for accessing phases of legislative proposals.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Phase.objects.all().order_by('-date')
    serializer_class = PhaseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'code', 'date']
    search_fields = ['name', 'observation']
    ordering_fields = ['date', 'name', 'code']


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for accessing authors of legislative proposals.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Author.objects.all().order_by('name')
    serializer_class = AuthorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['party', 'author_type']
    search_fields = ['name', 'party']
    ordering_fields = ['name', 'party']
    
    @action(detail=True, methods=['get'])
    def initiatives(self, request, pk=None):
        """
        Get all initiatives by this author.
        """
        author = self.get_object()
        projetos = author.projetos_lei.all()
        serializer = ProjetoLeiListSerializer(projetos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def party_groups(self, request):
        """
        Get only authors with author_type 'Grupo' (political parties),
        ensuring each party name appears only once.
        """
        # Get distinct party names
        distinct_names = Author.objects.filter(
            author_type='Grupo'
        ).values_list('name', flat=True).distinct()
        
        # For each distinct name, get the first (or most recent) record
        parties = []
        for name in distinct_names:
            party = Author.objects.filter(
                author_type='Grupo',
                name=name
            ).first()
            if party:
                parties.append(party)
        
        # Sort by name
        parties.sort(key=lambda x: x.name)
        
        serializer = self.get_serializer(parties, many=True)
        return Response(serializer.data)

class VoteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for accessing votes on legislative proposals.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Vote.objects.all().order_by('-date')
    serializer_class = VoteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['result', 'date', 'unanimous']
    search_fields = ['description', 'details']
    ordering_fields = ['date', 'result']


class PublicationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for accessing publications related to legislative proposals.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Publication.objects.all().order_by('-date')
    serializer_class = PublicationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['publication_type', 'legislature_code', 'date']
    ordering_fields = ['date', 'publication_type']


class CommissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for accessing commissions that review legislative proposals.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Commission.objects.all().order_by('name')
    serializer_class = CommissionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['competent', 'distribution_date']
    search_fields = ['name', 'observation']
    ordering_fields = ['name', 'distribution_date']


class DebateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for accessing debates related to legislative proposals.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Debate.objects.all().order_by('-date')
    serializer_class = DebateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date', 'session_phase']
    search_fields = ['summary', 'content']
    ordering_fields = ['date', 'start_time']


class TypeListView(APIView):
    """
    Returns a list of all unique initiative types.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        types = ProjetoLei.objects.values_list('type', flat=True).distinct().order_by('type')
        return Response(list(types))


class UniquePhaseNamesView(APIView):
    """
    Returns a list of all unique phase names.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get distinct phase names directly as a list
        phases = list(Phase.objects.values_list('name', flat=True).distinct().order_by('name'))
        # Return just the names as a list
        return Response(phases)


