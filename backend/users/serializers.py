from rest_framework import serializers
from django.contrib.auth import get_user_model
from sections.models import GroupMembership
from core.validators import validate_phone, validate_name

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    groups_info = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone', 'avatar', 'is_staff', 'groups_info']
        read_only_fields = ['id', 'is_staff']
    
    def validate_phone(self, value):
        if value:
            validate_phone(value)
        return value
    
    def validate_first_name(self, value):
        if value:
            validate_name(value)
        return value
    
    def validate_last_name(self, value):
        if value:
            validate_name(value)
        return value
    
    def get_groups_info(self, obj):
        memberships = GroupMembership.objects.filter(user=obj).select_related('group__section')
        return [{'group_id': m.group.id, 'group_name': m.group.name, 'section': m.group.section.name} for m in memberships]

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'first_name', 'last_name', 'phone']
    
    def validate_phone(self, value):
        if value:
            validate_phone(value)
        return value
    
    def validate_first_name(self, value):
        if value:
            validate_name(value)
        return value
    
    def validate_last_name(self, value):
        if value:
            validate_name(value)
        return value
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
