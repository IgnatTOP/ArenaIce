from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Event(models.Model):
    EVENT_TYPES = [
        ('hockey', 'Хоккей'),
        ('figure_skating', 'Фигурное катание'),
        ('show', 'Шоу'),
        ('competition', 'Соревнование'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    date = models.DateTimeField()
    image = models.ImageField(upload_to='events/')
    price_min = models.DecimalField(max_digits=10, decimal_places=2)
    price_max = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return self.title

class SeatSchema(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name='seat_schema')
    schema_data = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return f"Schema for {self.event.title}"

class Seat(models.Model):
    SEAT_STATUS = [
        ('available', 'Доступно'),
        ('reserved', 'Забронировано'),
        ('sold', 'Продано'),
    ]
    
    schema = models.ForeignKey(SeatSchema, on_delete=models.CASCADE, related_name='seats')
    sector = models.CharField(max_length=10)
    row = models.IntegerField()
    number = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=SEAT_STATUS, default='available')
    
    class Meta:
        unique_together = ['schema', 'sector', 'row', 'number']
    
    def __str__(self):
        return f"{self.sector}-{self.row}-{self.number}"

class Ticket(models.Model):
    TICKET_STATUS = [
        ('pending', 'Ожидает оплаты'),
        ('paid', 'Оплачен'),
        ('cancelled', 'Отменен'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='tickets')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    status = models.CharField(max_length=20, choices=TICKET_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['event', 'seat']
    
    def __str__(self):
        return f"Ticket {self.id} - {self.event.title}"
