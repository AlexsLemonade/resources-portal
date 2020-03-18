#!/bin/bash -e

python wait_for_postgres.py
./manage.py test
ls -lah /tmp
coverage report -m
