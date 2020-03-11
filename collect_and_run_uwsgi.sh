#!/bin/sh
python manage.py collectstatic --noinput
uwsgi --ini uwsgi.ini --http $HTTP_PORT
