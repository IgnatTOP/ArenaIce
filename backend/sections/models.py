from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Section(models.Model):
    SECTION_TYPES = [
        ('hockey', 'Хоккей'),
        ('figure_skating', 'Фигурное катание'),
    ]
    
    name = models.CharField(max_length=100)
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES)
    description = models.TextField()
    image = models.ImageField(upload_to='sections/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Group(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='groups')
    name = models.CharField(max_length=100)
    max_members = models.IntegerField(default=20)
    
    def __str__(self):
        return f"{self.section.name} - {self.name}"

class Schedule(models.Model):
    DAYS = [
        (0, 'Понедельник'),
        (1, 'Вторник'),
        (2, 'Среда'),
        (3, 'Четверг'),
        (4, 'Пятница'),
        (5, 'Суббота'),
        (6, 'Воскресенье'),
    ]
    
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAYS)
    time_start = models.TimeField()
    time_end = models.TimeField()
    
    class Meta:
        ordering = ['day_of_week', 'time_start']
    
    def __str__(self):
        return f"{self.group.name} - {self.get_day_of_week_display()} {self.time_start}"

class GroupMembership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'group']
    
    def __str__(self):
        return f"{self.user.email} - {self.group.name}"

class SectionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]
    
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='requests')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='section_requests')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.section.name}"
