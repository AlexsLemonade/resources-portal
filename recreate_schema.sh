#! /bin/sh
docker-compose run --rm postgres psql -h postgres -U postgres -a -c "DROP SCHEMA public CASCADE;CREATE SCHEMA public;"
docker-compose run --rm api python3 manage.py migrate
