from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from .models import Event, SeatSchema, Seat, Ticket

class SeatInline(admin.TabularInline):
    model = Seat
    extra = 0
    fields = ['sector', 'row', 'number', 'price', 'status']

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'date', 'price_min', 'price_max', 'is_active', 'schema_link']
    list_filter = ['event_type', 'is_active', 'date']
    search_fields = ['title', 'description']
    list_editable = ['is_active']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'event_type', 'date', 'image')
        }),
        ('Цены', {
            'fields': ('price_min', 'price_max')
        }),
        ('Статус', {
            'fields': ('is_active',)
        }),
    )
    
    def schema_link(self, obj):
        try:
            schema = obj.seat_schema
            url = reverse('admin:events_seatschema_change', args=[schema.id])
            seats_count = schema.seats.count()
            return format_html(
                '<a href="{}" style="color: green; font-weight: bold;">✅ Схема ({} мест)</a>',
                url, seats_count
            )
        except SeatSchema.DoesNotExist:
            url = reverse('admin:events_seatschema_add') + f'?event={obj.id}'
            return format_html(
                '<a href="{}" style="color: red; font-weight: bold;">➕ Создать схему</a>',
                url
            )
    schema_link.short_description = 'Схема зала'

@admin.register(SeatSchema)
class SeatSchemaAdmin(admin.ModelAdmin):
    list_display = ['event', 'get_seats_count', 'get_sectors_info']
    inlines = [SeatInline]
    
    def get_seats_count(self, obj):
        return obj.seats.count()
    get_seats_count.short_description = 'Количество мест'
    
    def get_sectors_info(self, obj):
        sectors = obj.seats.values_list('sector', flat=True).distinct()
        return ', '.join(sorted(set(sectors)))
    get_sectors_info.short_description = 'Секторы'
    
    def get_changeform_initial_data(self, request):
        """Автоматически подставляем событие из GET параметра"""
        initial = super().get_changeform_initial_data(request)
        if 'event' in request.GET:
            initial['event'] = request.GET['event']
        return initial
    
    actions = [
        'generate_small_hall',
        'generate_medium_hall', 
        'generate_large_hall',
        'clear_all_seats'
    ]
    
    def generate_small_hall(self, request, queryset):
        """Малый зал: 2 сектора x 5 рядов x 10 мест"""
        for schema in queryset:
            Seat.objects.filter(schema=schema).delete()
            sectors = ['A', 'B']
            for sector in sectors:
                for row in range(1, 6):
                    for number in range(1, 11):
                        if row <= 2:
                            price = schema.event.price_max
                        else:
                            price = schema.event.price_min
                        
                        Seat.objects.create(
                            schema=schema,
                            sector=sector,
                            row=row,
                            number=number,
                            price=price
                        )
        self.message_user(request, f"Малый зал создан: 2 сектора x 5 рядов x 10 мест = 100 мест")
    generate_small_hall.short_description = "🏟️ Малый зал (100 мест)"
    
    def generate_medium_hall(self, request, queryset):
        """Средний зал: 3 сектора x 10 рядов x 15 мест"""
        for schema in queryset:
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
                        
                        Seat.objects.create(
                            schema=schema,
                            sector=sector,
                            row=row,
                            number=number,
                            price=price
                        )
        self.message_user(request, f"Средний зал создан: 3 сектора x 10 рядов x 15 мест = 450 мест")
    generate_medium_hall.short_description = "🏟️ Средний зал (450 мест)"
    
    def generate_large_hall(self, request, queryset):
        """Большой зал: 4 сектора x 15 рядов x 20 мест"""
        for schema in queryset:
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
                        
                        Seat.objects.create(
                            schema=schema,
                            sector=sector,
                            row=row,
                            number=number,
                            price=price
                        )
        self.message_user(request, f"Большой зал создан: 4 сектора x 15 рядов x 20 мест = 1200 мест")
    generate_large_hall.short_description = "🏟️ Большой зал (1200 мест)"
    
    def clear_all_seats(self, request, queryset):
        """Удалить все места"""
        total = 0
        for schema in queryset:
            count = schema.seats.count()
            schema.seats.all().delete()
            total += count
        self.message_user(request, f"Удалено {total} мест из {queryset.count()} схем")
    clear_all_seats.short_description = "🗑️ Очистить все места"

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ['schema', 'sector', 'row', 'number', 'price', 'status']
    list_filter = ['status', 'sector', 'schema__event']
    search_fields = ['sector', 'row', 'number']
    list_editable = ['price', 'status']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('schema__event')

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'event', 'get_seat_info', 'user', 'status', 'created_at']
    list_filter = ['status', 'event']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at']
    
    def get_seat_info(self, obj):
        return f"{obj.seat.sector}-{obj.seat.row}-{obj.seat.number}"
    get_seat_info.short_description = 'Место'
