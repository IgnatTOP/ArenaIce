from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from events.models import Event, SeatSchema, Seat
from sections.models import Section, Group, Schedule
from datetime import datetime, timedelta, time

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        admin = User.objects.create_superuser(
            email='admin@arena.ru',
            username='admin',
            password='admin123'
        )
        
        event1 = Event.objects.create(
            title='Хоккейный матч: Спартак - ЦСКА',
            description='Захватывающий матч между двумя сильнейшими командами',
            event_type='hockey',
            date=datetime.now() + timedelta(days=7),
            price_min=500,
            price_max=2000,
            image='events/hockey.jpg'
        )
        
        schema1 = SeatSchema.objects.create(event=event1, schema_data={})
        for sector in ['A', 'B', 'C']:
            for row in range(1, 6):
                for num in range(1, 11):
                    Seat.objects.create(
                        schema=schema1,
                        sector=sector,
                        row=row,
                        number=num,
                        price=500 if sector == 'C' else 1000 if sector == 'B' else 2000
                    )
        
        event2 = Event.objects.create(
            title='Ледовое шоу "Щелкунчик"',
            description='Волшебное представление на льду',
            event_type='show',
            date=datetime.now() + timedelta(days=14),
            price_min=800,
            price_max=3000,
            image='events/show.jpg'
        )
        
        hockey = Section.objects.create(
            name='Хоккейная секция',
            section_type='hockey',
            description='Обучение хоккею для детей и взрослых',
            price=5000,
            image='sections/hockey.jpg'
        )
        
        group1 = Group.objects.create(section=hockey, name='Начинающие (6-8 лет)', max_members=15)
        Schedule.objects.create(group=group1, day_of_week=0, time_start=time(16, 0), time_end=time(17, 30))
        Schedule.objects.create(group=group1, day_of_week=2, time_start=time(16, 0), time_end=time(17, 30))
        
        figure = Section.objects.create(
            name='Фигурное катание',
            section_type='figure_skating',
            description='Обучение фигурному катанию',
            price=6000,
            image='sections/figure.jpg'
        )
        
        group2 = Group.objects.create(section=figure, name='Продвинутые', max_members=12)
        Schedule.objects.create(group=group2, day_of_week=1, time_start=time(18, 0), time_end=time(19, 30))
        Schedule.objects.create(group=group2, day_of_week=3, time_start=time(18, 0), time_end=time(19, 30))
        
        self.stdout.write(self.style.SUCCESS('Тестовые данные созданы!'))
        self.stdout.write(f'Админ: admin@arena.ru / admin123')
