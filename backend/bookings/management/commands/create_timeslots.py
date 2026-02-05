from django.core.management.base import BaseCommand
from bookings.models import TimeSlot
from datetime import time

class Command(BaseCommand):
    help = 'Создает начальные временные слоты для аренды льда'

    def handle(self, *args, **options):
        TimeSlot.objects.all().delete()
        
        # Утренние слоты (8:00 - 12:00) - 3000₽
        for hour in range(8, 12):
            TimeSlot.objects.create(
                time_start=time(hour, 0),
                time_end=time(hour + 1, 0),
                price=3000,
                is_active=True
            )
        
        # Дневные слоты (12:00 - 18:00) - 4000₽
        for hour in range(12, 18):
            TimeSlot.objects.create(
                time_start=time(hour, 0),
                time_end=time(hour + 1, 0),
                price=4000,
                is_active=True
            )
        
        # Вечерние слоты (18:00 - 22:00) - 5000₽
        for hour in range(18, 22):
            TimeSlot.objects.create(
                time_start=time(hour, 0),
                time_end=time(hour + 1, 0),
                price=5000,
                is_active=True
            )
        
        self.stdout.write(self.style.SUCCESS(f'Создано {TimeSlot.objects.count()} временных слотов'))
