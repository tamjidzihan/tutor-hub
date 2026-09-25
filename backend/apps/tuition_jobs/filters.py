import django_filters
from django.db.models import Q
from .models import TuitionJob

class TuitionJobFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name='city', lookup_expr='iexact')
    area = django_filters.CharFilter(field_name='area', lookup_expr='icontains')
    class_level = django_filters.CharFilter(field_name='class_level', lookup_expr='icontains')
    curriculum = django_filters.CharFilter(field_name='curriculum', lookup_expr='icontains')
    tuition_type = django_filters.CharFilter(field_name='tuition_type', lookup_expr='icontains')
    gender = django_filters.CharFilter(method='filter_gender')
    salary_min = django_filters.NumberFilter(field_name='salary', lookup_expr='gte')
    salary_max = django_filters.NumberFilter(field_name='salary', lookup_expr='lte')
    subject = django_filters.CharFilter(method='filter_subject')
    job_id = django_filters.CharFilter(field_name='job_id', lookup_expr='icontains')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = TuitionJob
        fields = ['city', 'status', 'is_urgent']

    def filter_subject(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(subjects__icontains=value)

    def filter_gender(self, queryset, name, value):
        if not value or value.lower() == 'any':
            return queryset
        return queryset.filter(preferred_tutor_gender__icontains=value)

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(title__icontains=value) |
            Q(job_id__icontains=value) |
            Q(area__icontains=value) |
            Q(subjects__icontains=value) |
            Q(class_level__icontains=value)
        )
