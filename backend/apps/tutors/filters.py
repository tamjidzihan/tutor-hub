import django_filters
from django.db.models import Q
from .models import TutorProfile

class TutorFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name='city', lookup_expr='iexact')
    area = django_filters.CharFilter(method='filter_area')
    subject = django_filters.CharFilter(method='filter_subject')
    class_level = django_filters.CharFilter(method='filter_class_level')
    gender = django_filters.CharFilter(field_name='gender', lookup_expr='iexact')
    university = django_filters.CharFilter(field_name='university', lookup_expr='icontains')
    salary_max = django_filters.NumberFilter(field_name='expected_salary', lookup_expr='lte')
    experience_min = django_filters.NumberFilter(field_name='experience_years', lookup_expr='gte')
    is_verified = django_filters.BooleanFilter(field_name='is_verified')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = TutorProfile
        fields = ['city', 'gender', 'is_verified']

    def filter_area(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(area__icontains=value) |
            Q(preferred_locations__icontains=value)
        )

    def filter_subject(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(subjects__icontains=value)

    def filter_class_level(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(classes__icontains=value)

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(user__first_name__icontains=value) |
            Q(user__last_name__icontains=value) |
            Q(university__icontains=value) |
            Q(department__icontains=value) |
            Q(tutor_id__icontains=value) |
            Q(subjects__icontains=value)
        )
