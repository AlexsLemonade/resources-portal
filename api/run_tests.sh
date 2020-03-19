#!/bin/bash -e

python wait_for_postgres.py
echo "#############################"
printenv
echo "#############################"
ls /tmp
echo "#############################"
touch .coverage
./manage.py test
echo "#############################"
ls -lah resources_portal
echo "#############################"
ls -lah
coverage report -m
