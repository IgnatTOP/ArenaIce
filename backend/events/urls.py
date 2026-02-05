from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, TicketViewSet, SeatSchemaViewSet, SeatViewSet

router = DefaultRouter()
router.register('events', EventViewSet)
router.register('tickets', TicketViewSet, basename='ticket')
router.register('seat-schemas', SeatSchemaViewSet)
router.register('seats', SeatViewSet)

urlpatterns = router.urls
