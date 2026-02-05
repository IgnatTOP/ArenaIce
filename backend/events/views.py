from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from django.db import transaction
from .models import Event, Seat, Ticket, SeatSchema
from .serializers import EventSerializer, SeatSerializer, TicketSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.filter(is_active=True)
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Event.objects.all()
        return Event.objects.filter(is_active=True)
    
    @action(detail=True, methods=['get'])
    def seats(self, request, pk=None):
        event = self.get_object()
        seats = Seat.objects.filter(schema__event=event)
        serializer = SeatSerializer(seats, many=True)
        return Response(serializer.data)

class SeatSchemaViewSet(viewsets.ModelViewSet):
    queryset = SeatSchema.objects.all()
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        from rest_framework import serializers
        class SeatSchemaSerializer(serializers.ModelSerializer):
            class Meta:
                model = SeatSchema
                fields = ['id', 'event', 'schema_data']
        return SeatSchemaSerializer
    
    @action(detail=True, methods=['post'])
    def generate_small_hall(self, request, pk=None):
        schema = self.get_object()
        Seat.objects.filter(schema=schema).delete()
        
        sectors = ['A', 'B']
        for sector in sectors:
            for row in range(1, 6):
                for number in range(1, 11):
                    price = schema.event.price_max if row <= 2 else schema.event.price_min
                    Seat.objects.create(schema=schema, sector=sector, row=row, number=number, price=price)
        
        return Response({'message': 'Малый зал создан (100 мест)'})
    
    @action(detail=True, methods=['post'])
    def generate_medium_hall(self, request, pk=None):
        schema = self.get_object()
        Seat.objects.filter(schema=schema).delete()
        
        sectors = ['A', 'B', 'C']
        for sector in sectors:
            for row in range(1, 11):
                for number in range(1, 16):
                    if row <= 3:
                        price = schema.event.price_max
                    elif row <= 7:
                        price = (schema.event.price_min + schema.event.price_max) / 2
                    else:
                        price = schema.event.price_min
                    Seat.objects.create(schema=schema, sector=sector, row=row, number=number, price=price)
        
        return Response({'message': 'Средний зал создан (450 мест)'})
    
    @action(detail=True, methods=['post'])
    def generate_large_hall(self, request, pk=None):
        schema = self.get_object()
        Seat.objects.filter(schema=schema).delete()
        
        sectors = ['A', 'B', 'C', 'D']
        for sector in sectors:
            for row in range(1, 16):
                for number in range(1, 21):
                    if row <= 5:
                        price = schema.event.price_max
                    elif row <= 10:
                        price = (schema.event.price_min + schema.event.price_max) / 2
                    else:
                        price = schema.event.price_min
                    Seat.objects.create(schema=schema, sector=sector, row=row, number=number, price=price)
        
        return Response({'message': 'Большой зал создан (1200 мест)'})

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = Seat.objects.all()
        schema_id = self.request.query_params.get('schema')
        if schema_id:
            queryset = queryset.filter(schema_id=schema_id)
        return queryset
    
    def list(self, request, *args, **kwargs):
        # Если фильтр по schema - возвращаем все без пагинации
        if request.query_params.get('schema'):
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return super().list(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        schema_id = request.data.get('schema_id')
        if schema_id:
            Seat.objects.filter(schema_id=schema_id).delete()
            return Response({'status': 'deleted'})
        return Response({'error': 'schema_id required'}, status=400)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        seats_data = request.data.get('seats', [])
        schema_id = seats_data[0]['schema'] if seats_data else None
        
        if not schema_id:
            return Response({'error': 'No seats data'}, status=400)
        
        schema = SeatSchema.objects.get(id=schema_id)
        seats = []
        for seat_data in seats_data:
            seat_data['schema'] = schema
            seats.append(Seat(**seat_data))
        
        Seat.objects.bulk_create(seats)
        return Response({'status': 'created', 'count': len(seats)})

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Ticket.objects.all()
        return Ticket.objects.filter(user=self.request.user)
    
    @transaction.atomic
    def create(self, request):
        seat_id = request.data.get('seat')
        event_id = request.data.get('event')
        
        seat = Seat.objects.select_for_update().get(id=seat_id)
        if seat.status != 'available':
            return Response({'error': 'Место недоступно'}, status=status.HTTP_400_BAD_REQUEST)
        
        seat.status = 'sold'
        seat.save()
        
        ticket = Ticket.objects.create(event_id=event_id, seat=seat, user=request.user, status='paid')
        serializer = self.get_serializer(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
