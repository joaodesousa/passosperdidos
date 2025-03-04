import django_filters
from django.db.models import Q
from .models import ProjetoLei, Phase, Author

class ProjetoLeiFilter(django_filters.FilterSet):
    title_contains = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    author_name = django_filters.CharFilter(method='filter_by_author_name')
    author_party = django_filters.CharFilter(field_name='authors__party', lookup_expr='iexact')
    phase_name = django_filters.CharFilter(field_name='phases__name', lookup_expr='iexact')
    date_after = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_before = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    type_in = django_filters.CharFilter(method='filter_by_multiple_types')
    
    class Meta:
        model = ProjetoLei
        fields = [
            'title_contains', 'author_name', 'author_party', 
            'phase_name', 'date_after', 'date_before', 'type_in',
            'legislature__number', 'initiative_number', 'type'
        ]
    
    def filter_by_author_name(self, queryset, name, value):
        return queryset.filter(authors__name__icontains=value)
    
    def filter_by_multiple_types(self, queryset, name, value):
        types = value.split(',')
        return queryset.filter(type__in=types)


class PhaseFilter(django_filters.FilterSet):
    name_contains = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    date_after = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_before = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    
    class Meta:
        model = Phase
        fields = ['name_contains', 'date_after', 'date_before', 'code']


class AuthorFilter(django_filters.FilterSet):
    name_contains = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    
    class Meta:
        model = Author
        fields = ['name_contains', 'party', 'author_type']