# resources_portal

[![Build Status](https://travis-ci.org/ccdl/resources_portal.svg?branch=master)](https://travis-ci.org/ccdl/resources_portal)
Portal for pediatric cancer researchers to discover and manage sharing of resources like cell lines, datasets, scientific code, etc.
[![Built with](https://img.shields.io/badge/Built_with-Cookiecutter_Django_Rest-F7B633.svg)](https://github.com/agconti/cookiecutter-django-rest)

Resources Portal. Check out the project's [documentation](http://ccdl.github.io/resources_portal/).

## Prerequisites

- [Docker](https://docs.docker.com/docker-for-mac/install/)

## Local Development

(from the `api` directory)

Start the dev server for local development:

```bash
docker-compose up
```

Run a command inside the docker container:

```bash
docker-compose run --rm web [command]
```

i.e. the tests:

```
docker-compose run --rm web ./run_tests.sh
```

The dev server runs by default on port 8000 with the docs being served at 8001.
If these ports are already in use on your local machine, you can run them at different ports with:
```bash
cd api && PORT=8002 DOCS_PORT=8003 docker-compose run --rm web [command]
```

## Cloud Development

(from the `infrastructure` directory)

Currently we do not have a staging or production stack, but a development stack can be deployed with:

```
python3 deploy.py -d [dockerhub-repo] -e dev -u [username] -v v0.0.0
```

You will need an `resources-portal-api:v0.0.0` image in the dockerhub-repo you supply. Run `python3 infrastructure/deploy.py -h` for more options.

Once your deployment is complete it will output the elastic_ip_address like:  `elastic_ip_address = X.X.X.X`
You can use this to make a curl request to the API like so:
```
curl -X POST http://X.X.X.X/v1/users -H "Content-Type: application/json" -d '{"username": "crazyparklady", "password": "i<3parks", "first_name": "Leslie", "last_name": "Knope", "email": "lknope@parks.pawneeindiana.gov"}'
```

Subsequent deploys to the same stack will use the same elastic IP address.

You can destroy an existing stack with:
```
python3 destroy_terraform.py -e dev -u [username]
```

The username you use to destroy should match the one you supplied to `deploy.py`.
