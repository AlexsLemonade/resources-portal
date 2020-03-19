#!/bin/bash -e

python wait_for_postgres.py
touch .coverage
./manage.py test
ls -lah
coverage report -m
