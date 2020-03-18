#!/bin/bash -e

python3 wait_for_postgres.py
./manage.py test
coverage report -m
