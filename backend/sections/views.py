from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser, AllowAny
from .models import Section, Group, Schedule, SectionRequest
from .serializers import SectionSerializer, GroupSerializer, ScheduleSerializer, SectionRequestSerializer

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Section.objects.all()
        return Section.objects.filter(is_active=True)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        # Разрешить всем видеть секции (публичный доступ)
        return [AllowAny()]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        # Разрешить всем видеть группы (публичный доступ)
        return [AllowAny()]

class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Schedule.objects.all()
        
        # Фильтр по группе из параметра (только для админов)
        group_id = self.request.query_params.get('group')
        if group_id and self.request.user.is_staff:
            return queryset.filter(group_id=group_id)
        
        # Для всех пользователей (включая админов) - только их группы
        group_ids = list(self.request.user.group_memberships.values_list('group_id', flat=True))
        if group_ids:
            queryset = queryset.filter(group_id__in=group_ids)
        else:
            queryset = queryset.none()
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class SectionRequestViewSet(viewsets.ModelViewSet):
    serializer_class = SectionRequestSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return SectionRequest.objects.all()
        if self.request.user.is_authenticated:
            return SectionRequest.objects.filter(user=self.request.user)
        return SectionRequest.objects.none()
    
    def get_permissions(self):
        # Разрешить создание заявок для всех (анонимных и авторизованных)
        if self.action == 'create':
            from rest_framework.permissions import AllowAny
            return [AllowAny()]
        # Для остальных действий требуется авторизация
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        # Если пользователь авторизован - привязываем к нему
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user, status='pending')
        else:
            # Анонимная заявка - без привязки к пользователю
            serializer.save(user=None, status='pending')
    
    def update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({'error': 'Только администратор может изменять статус'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({'error': 'Только администратор может изменять статус'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)
