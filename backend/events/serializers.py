from rest_framework import serializers
from .models import Event, SeatSchema, Seat, Ticket

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'schema', 'sector', 'row', 'number', 'price', 'status']

class SeatSchemaSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    
    class Meta:
        model = SeatSchema
        fields = ['id', 'schema_data', 'seats']

class EventSerializer(serializers.ModelSerializer):
    seat_schema = SeatSchemaSerializer(read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'event_type', 'date', 'image', 'price_min', 'price_max', 'is_active', 'seat_schema']

class TicketSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    seat_info = SeatSerializer(source='seat', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Ticket
        fields = ['id', 'event', 'event_title', 'seat', 'seat_info', 'user_email', 'status', 'created_at']
        read_only_fields = ['created_at']
