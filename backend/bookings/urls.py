from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IceBookingViewSet, TimeSlotViewSet

router = DefaultRouter()
router.register('bookings', IceBookingViewSet, basename='booking')
router.register('timeslots', TimeSlotViewSet, basename='timeslot')

urlpatterns = router.urls
