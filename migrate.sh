#!/bin/bash
cd backend
source venv/bin/activate
python manage.py makemigrations users events sections bookings
python manage.py migrate
echo "Миграции выполнены успешно!"
