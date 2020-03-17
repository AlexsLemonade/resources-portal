# resources_portal

[![Build Status](https://travis-ci.org/ccdl/resources_portal.svg?branch=master)](https://travis-ci.org/ccdl/resources_portal)
Portal for pediatric cancer researchers to discover and manage sharing of resources like cell lines, datasets, scientific code, etc.
[![Built with](https://img.shields.io/badge/Built_with-Cookiecutter_Django_Rest-F7B633.svg)](https://github.com/agconti/cookiecutter-django-rest)

Resources Portal. Check out the project's [documentation](http://ccdl.github.io/resources_portal/).

## Prerequisites

- [Docker](https://docs.docker.com/docker-for-mac/install/)

## Local Development

Start the dev server for local development:

```bash
cd api && docker-compose up
```

Run a command inside the docker container:

```bash
cd api && docker-compose run --rm web [command]
```

The dev server runs by default on port 8000 with the docs being served at 8001.
If these ports are already in use on your local machine, you can run them at different ports with:
```bash
cd api && PORT=8002 DOCS_PORT=8003 docker-compose run --rm web [command]
```

## Cloud Development

Currently we do not have a staging or production stack, but a development stack can be deployed with:

```
cd infrastructure && python3 deploy.py -d [dockerhub-repo] -e dev -u [username] -v v0.0.0
```

You will need an `resources-portal-api:v0.0.0` image in the dockerhub-repo you supply.

Run `python3 infrastructure/deploy.py -h` for more options.
