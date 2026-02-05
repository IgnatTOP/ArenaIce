#!/bin/bash

cd /home/ignat/ArenaIce/backend
source venv/bin/activate

echo "Запуск Django сервера..."
python manage.py runserver 0.0.0.0:8000
