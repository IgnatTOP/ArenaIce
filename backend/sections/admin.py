from django.contrib import admin
from .models import Section, Group, Schedule, GroupMembership, SectionRequest

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'section_type', 'price', 'is_active']
    list_filter = ['section_type', 'is_active']

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'section', 'max_members']
    list_filter = ['section']

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['group', 'day_of_week', 'time_start', 'time_end']
    list_filter = ['day_of_week']

@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'group', 'joined_at']
    search_fields = ['user__email']

@admin.register(SectionRequest)
class SectionRequestAdmin(admin.ModelAdmin):
    list_display = ['name', 'section', 'status', 'created_at']
    list_filter = ['status', 'section']
    actions = ['approve_requests', 'reject_requests']
    
    def approve_requests(self, request, queryset):
        queryset.update(status='approved')
    
    def reject_requests(self, request, queryset):
        queryset.update(status='rejected')
