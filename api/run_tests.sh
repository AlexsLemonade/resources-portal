#!/bin/bash -e

python wait_for_postgres.py
./manage.py test
touch .coverage
coverage report -m
