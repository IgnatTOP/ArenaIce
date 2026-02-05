from rest_framework import serializers
from .models import IceBooking, TimeSlot
from sections.models import Schedule
from events.models import Event
from datetime import datetime, timedelta
from core.validators import validate_phone, validate_name, validate_message

class TimeSlotSerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.SerializerMethodField()
    
    class Meta:
        model = TimeSlot
        fields = ['id', 'time_start', 'time_end', 'price', 'day_of_week', 'day_of_week_display', 'is_active']
    
    def get_day_of_week_display(self, obj):
        if obj.day_of_week is None:
            return 'Все дни'
        days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
        return days[obj.day_of_week]

class IceBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = IceBooking
        fields = ['id', 'date', 'time_start', 'time_end', 'duration_hours', 'name', 'phone', 'message', 'status', 'created_at']
        read_only_fields = ['created_at']
    
    def validate_name(self, value):
        validate_name(value)
        return value
    
    def validate_phone(self, value):
        validate_phone(value)
        return value
    
    def validate_message(self, value):
        if value:
            validate_message(value)
        return value
    
    def validate(self, data):
        # Пропускаем валидацию если обновляется только статус
        if 'date' not in data or 'time_start' not in data or 'time_end' not in data:
            return data
            
        date = data['date']
        time_start = data['time_start']
        time_end = data['time_end']
        
        start_dt = datetime.combine(date, time_start)
        end_dt = datetime.combine(date, time_end)
        duration = (end_dt - start_dt).total_seconds() / 3600
        
        if duration < 1:
            raise serializers.ValidationError("Минимальная длительность аренды - 1 час")
        
        if duration > 8:
            raise serializers.ValidationError("Максимальная длительность аренды - 8 часов")
        
        if duration >= 3:
            raise serializers.ValidationError("Для аренды более 3 часов требуется согласование")
        
        day_of_week = date.weekday()
        schedules = Schedule.objects.filter(day_of_week=day_of_week)
        for schedule in schedules:
            if not (time_end <= schedule.time_start or time_start >= schedule.time_end):
                raise serializers.ValidationError("Время занято расписанием секций")
        
        events = Event.objects.filter(date__date=date)
        for event in events:
            event_time = event.date.time()
            if not (time_end <= event_time or time_start >= event_time):
                raise serializers.ValidationError("Время занято событием")
        
        data['duration_hours'] = duration
        return data

class AvailableSlotSerializer(serializers.Serializer):
    date = serializers.DateField()
    time_start = serializers.TimeField()
    time_end = serializers.TimeField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    is_available = serializers.BooleanField(default=True)
    booked_by = serializers.CharField(required=False, allow_null=True)
