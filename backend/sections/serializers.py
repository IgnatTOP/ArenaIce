from rest_framework import serializers
from .models import Section, Group, Schedule, GroupMembership, SectionRequest
from core.validators import validate_phone, validate_name, validate_message

class ScheduleSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = Schedule
        fields = ['id', 'group', 'group_name', 'day_of_week', 'day_name', 'time_start', 'time_end']

class GroupSerializer(serializers.ModelSerializer):
    schedules = ScheduleSerializer(many=True, read_only=True)
    members_count = serializers.SerializerMethodField()
    section_name = serializers.CharField(source='section.name', read_only=True)
    
    class Meta:
        model = Group
        fields = ['id', 'section', 'section_name', 'name', 'max_members', 'members_count', 'schedules']
    
    def get_members_count(self, obj):
        return obj.memberships.count()

class SectionSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'name', 'section_type', 'description', 'image', 'price', 'is_active', 'groups']

class SectionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionRequest
        fields = ['id', 'section', 'name', 'phone', 'message', 'status', 'created_at']
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
