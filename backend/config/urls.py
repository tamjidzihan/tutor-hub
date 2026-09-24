from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Documentation Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Modular Domain APIs
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/locations/', include('apps.locations.urls')),
    path('api/v1/categories/', include('apps.categories.urls')),
    path('api/v1/tutors/', include('apps.tutors.urls')),
    path('api/v1/jobs/', include('apps.tuition_jobs.urls')),
    path('api/v1/applications/', include('apps.applications.urls')),
    path('api/v1/requirements/', include('apps.requirements.urls')),
    path('api/v1/reviews/', include('apps.reviews.urls')),
    path('api/v1/testimonials/', include('apps.testimonials.urls')),
    path('api/v1/affiliates/', include('apps.affiliates.urls')),
    path('api/v1/content/', include('apps.content.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
