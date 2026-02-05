from django.contrib import admin
from .models import IceBooking, TimeSlot

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['time_start', 'time_end', 'price', 'is_active']
    list_filter = ['is_active']
    list_editable = ['price', 'is_active']
    ordering = ['time_start']

@admin.register(IceBooking)
class IceBookingAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'date', 'time_start', 'time_end', 'status', 'created_at']
    list_filter = ['status', 'date']
    search_fields = ['name', 'phone']
    actions = ['approve_bookings', 'reject_bookings']
    readonly_fields = ['created_at']
    
    def approve_bookings(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f"{queryset.count()} заявок одобрено")
    approve_bookings.short_description = "Одобрить выбранные заявки"
    
    def reject_bookings(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} заявок отклонено")
    reject_bookings.short_description = "Отклонить выбранные заявки"
