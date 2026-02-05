from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from sections.models import GroupMembership, Group, Section, Schedule
from events.models import Event, SeatSchema, Seat
from rest_framework import serializers

User = get_user_model()

class GroupMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = GroupMembership
        fields = ['id', 'user', 'user_email', 'group', 'group_name', 'joined_at']
        read_only_fields = ['joined_at']

class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['post'], url_path='add-user-to-group')
    def add_user_to_group(self, request):
        user_id = request.data.get('user_id')
        group_id = request.data.get('group_id')
        
        try:
            user = User.objects.get(id=user_id)
            group = Group.objects.get(id=group_id)
            membership, created = GroupMembership.objects.get_or_create(user=user, group=group)
            
            return Response({
                'message': 'Пользователь добавлен в группу' if created else 'Пользователь уже в группе',
                'membership_id': membership.id
            })
        except User.DoesNotExist:
            return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)
        except Group.DoesNotExist:
            return Response({'error': 'Группа не найдена'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], url_path='memberships')
    def list_memberships(self, request):
        memberships = GroupMembership.objects.all().select_related('user', 'group')
        serializer = GroupMembershipSerializer(memberships, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'], url_path='remove-from-group/(?P<membership_id>[^/.]+)')
    def remove_from_group(self, request, membership_id=None):
        try:
            membership = GroupMembership.objects.get(id=membership_id)
            membership.delete()
            return Response({'message': 'Пользователь удалён из группы'})
        except GroupMembership.DoesNotExist:
            return Response({'error': 'Членство не найдено'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'], url_path='create-event')
    def create_event(self, request):
        from events.serializers import EventSerializer
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.save()
            
            sectors = request.data.get('sectors', ['A', 'B', 'C'])
            rows = request.data.get('rows', 5)
            seats_per_row = request.data.get('seats_per_row', 10)
            
            schema = SeatSchema.objects.create(event=event, schema_data={})
            for sector in sectors:
                for row in range(1, rows + 1):
                    for num in range(1, seats_per_row + 1):
                        price = request.data.get(f'price_{sector}', 1000)
                        Seat.objects.create(schema=schema, sector=sector, row=row, number=num, price=price)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='create-section')
    def create_section(self, request):
        from sections.serializers import SectionSerializer
        serializer = SectionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='create-group')
    def create_group(self, request):
        section_id = request.data.get('section')
        name = request.data.get('name')
        max_members = request.data.get('max_members', 20)
        
        try:
            section = Section.objects.get(id=section_id)
            group = Group.objects.create(section=section, name=name, max_members=max_members)
            return Response({'id': group.id, 'name': group.name}, status=status.HTTP_201_CREATED)
        except Section.DoesNotExist:
            return Response({'error': 'Секция не найдена'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'], url_path='create-schedule')
    def create_schedule(self, request):
        group_id = request.data.get('group')
        day_of_week = request.data.get('day_of_week')
        time_start = request.data.get('time_start')
        time_end = request.data.get('time_end')
        
        try:
            group = Group.objects.get(id=group_id)
            schedule = Schedule.objects.create(
                group=group,
                day_of_week=day_of_week,
                time_start=time_start,
                time_end=time_end
            )
            return Response({'id': schedule.id}, status=status.HTTP_201_CREATED)
        except Group.DoesNotExist:
            return Response({'error': 'Группа не найдена'}, status=status.HTTP_404_NOT_FOUND)
