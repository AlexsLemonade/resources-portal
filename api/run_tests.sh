#!/bin/bash -e

python wait_for_postgres.py
python wait_for_elasticsearch.py
coverage run ./manage.py test --no-input
coverage report -m
