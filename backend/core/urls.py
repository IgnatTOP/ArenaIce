from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/users/', include('users.urls')),
    path('api/events/', include('events.urls')),
    path('api/sections/', include('sections.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/schema/', SpectacularAPIView.as_view()),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
