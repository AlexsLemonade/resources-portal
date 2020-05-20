#! /bin/sh
docker-compose --env-file ./docker-compose.env run --rm postgres psql -h postgres -U postgres -a -c "DROP SCHEMA public CASCADE;CREATE SCHEMA public;"
docker-compose --env-file ./docker-compose.env run --rm api python3 manage.py migrate
