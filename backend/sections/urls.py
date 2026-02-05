from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SectionViewSet, GroupViewSet, ScheduleViewSet, SectionRequestViewSet

router = DefaultRouter()
router.register('sections', SectionViewSet)
router.register('groups', GroupViewSet)
router.register('schedules', ScheduleViewSet, basename='schedule')
router.register('requests', SectionRequestViewSet, basename='request')

urlpatterns = router.urls
