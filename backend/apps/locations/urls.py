from django.urls import path
from .views import CityListView, AreaListView

urlpatterns = [
    path('', CityListView.as_view(), name='city-list'),
    path('<slug:city_slug>/areas/', AreaListView.as_view(), name='area-list'),
]
