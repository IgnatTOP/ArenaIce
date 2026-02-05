from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class TimeSlot(models.Model):
    """Временные слоты для аренды льда"""
    DAYS_OF_WEEK = [
        (0, 'Понедельник'),
        (1, 'Вторник'),
        (2, 'Среда'),
        (3, 'Четверг'),
        (4, 'Пятница'),
        (5, 'Суббота'),
        (6, 'Воскресенье'),
    ]
    
    time_start = models.TimeField()
    time_end = models.TimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Базовая цена')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK, null=True, blank=True, help_text='Оставьте пустым для всех дней')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['day_of_week', 'time_start']
        unique_together = ['time_start', 'time_end', 'day_of_week']
    
    def __str__(self):
        day = dict(self.DAYS_OF_WEEK).get(self.day_of_week, 'Все дни') if self.day_of_week is not None else 'Все дни'
        return f"{day}: {self.time_start} - {self.time_end} ({self.price}₽)"

class IceBooking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ice_bookings', null=True, blank=True)
    date = models.DateField()
    time_start = models.TimeField()
    time_end = models.TimeField()
    duration_hours = models.DecimalField(max_digits=4, decimal_places=2)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.date} {self.time_start}"
