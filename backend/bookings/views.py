from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from datetime import datetime, timedelta, time
from django.db import models
from .models import IceBooking, TimeSlot
from .serializers import IceBookingSerializer, AvailableSlotSerializer, TimeSlotSerializer
from sections.models import Schedule
from events.models import Event

class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class IceBookingViewSet(viewsets.ModelViewSet):
    serializer_class = IceBookingSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return []
        return [IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return IceBooking.objects.all()
        return IceBooking.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user, status='pending')
    
    def update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({'error': 'Только администратор может изменять статус'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({'error': 'Только администратор может изменять статус'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    @permission_classes([AllowAny])
    def available_slots(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'Требуется параметр date'}, status=status.HTTP_400_BAD_REQUEST)
        
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        day_of_week = date.weekday()
        
        # Получаем слоты для конкретного дня недели или общие слоты
        time_slots = TimeSlot.objects.filter(
            is_active=True
        ).filter(
            models.Q(day_of_week=day_of_week) | models.Q(day_of_week__isnull=True)
        ).order_by('time_start')
        
        if not time_slots.exists():
            # Если слотов нет, используем дефолтные
            time_slots = self._get_default_slots()
        
        occupied_slots = []
        
        # Занятые слоты из расписания секций
        schedules = Schedule.objects.filter(day_of_week=day_of_week)
        for schedule in schedules:
            occupied_slots.append((schedule.time_start, schedule.time_end))
        
        # Занятые слоты из событий
        events = Event.objects.filter(date__date=date)
        for event in events:
            event_time = event.date.time()
            occupied_slots.append((event_time, (datetime.combine(date, event_time) + timedelta(hours=2)).time()))
        
        # Занятые слоты из одобренных бронирований
        bookings = IceBooking.objects.filter(date=date, status='approved')
        
        available = []
        
        for slot in time_slots:
            slot_start_dt = datetime.combine(date, slot.time_start)
            slot_end_dt = datetime.combine(date, slot.time_end)
            is_free = True
            booked_by = None
            
            # Проверяем пересечение с расписанием секций
            for schedule in schedules:
                sched_start_dt = datetime.combine(date, schedule.time_start)
                sched_end_dt = datetime.combine(date, schedule.time_end)
                if not (slot_end_dt <= sched_start_dt or slot_start_dt >= sched_end_dt):
                    is_free = False
                    break
            
            # Проверяем пересечение с событиями
            if is_free:
                for event in events:
                    event_time = event.date.time()
                    event_start_dt = datetime.combine(date, event_time)
                    event_end_dt = event_start_dt + timedelta(hours=2)
                    if not (slot_end_dt <= event_start_dt or slot_start_dt >= event_end_dt):
                        is_free = False
                        break
            
            # Проверяем пересечение с бронированиями
            if is_free:
                for booking in bookings:
                    booking_start_dt = datetime.combine(date, booking.time_start)
                    booking_end_dt = datetime.combine(date, booking.time_end)
                    if not (slot_end_dt <= booking_start_dt or slot_start_dt >= booking_end_dt):
                        is_free = False
                        booked_by = booking.name
                        break
            
            available.append({
                'date': date,
                'time_start': slot.time_start,
                'time_end': slot.time_end,
                'price': slot.price,
                'is_available': is_free,
                'booked_by': booked_by
            })
        
        serializer = AvailableSlotSerializer(available, many=True)
        return Response(serializer.data)
    
    def _get_default_slots(self):
        """Дефолтные слоты если в базе пусто"""
        default_slots = []
        for hour in range(8, 22):
            default_slots.append(TimeSlot(
                time_start=time(hour, 0),
                time_end=time(hour + 1, 0),
                price=4000
            ))
        return default_slots
