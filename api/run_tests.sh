#!/bin/bash -e

python wait_for_postgres.py
./manage.py test
COVERAGE_STORAGE=json coverage report -m
