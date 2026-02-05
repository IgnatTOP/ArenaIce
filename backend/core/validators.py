from django.core.exceptions import ValidationError
import re

def validate_phone(value):
    """Валидация телефона: +7 (XXX) XXX-XX-XX или 8XXXXXXXXXX"""
    phone = re.sub(r'[^\d+]', '', value)
    if not re.match(r'^(\+7|8)\d{10}$', phone):
        raise ValidationError('Неверный формат телефона. Используйте +7 (XXX) XXX-XX-XX')

def validate_name(value):
    """Валидация имени: минимум 2 символа, только буквы и пробелы"""
    if len(value.strip()) < 2:
        raise ValidationError('Имя должно содержать минимум 2 символа')
    if not re.match(r'^[а-яА-ЯёЁa-zA-Z\s-]+$', value):
        raise ValidationError('Имя может содержать только буквы, пробелы и дефисы')

def validate_message(value):
    """Валидация сообщения: минимум 10 символов"""
    if value and len(value.strip()) < 10:
        raise ValidationError('Сообщение должно содержать минимум 10 символов')

def validate_price(value):
    """Валидация цены: положительное число"""
    if value <= 0:
        raise ValidationError('Цена должна быть больше 0')

def validate_duration(value):
    """Валидация длительности: от 1 до 8 часов"""
    if value < 1 or value > 8:
        raise ValidationError('Длительность должна быть от 1 до 8 часов')
