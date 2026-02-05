from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from .views_admin import AdminViewSet

router = DefaultRouter()
router.register('', UserViewSet)
router.register('admin', AdminViewSet, basename='admin')

urlpatterns = router.urls
