# resources-portal

[![Build Status](https://travis-ci.org/ccdl/resources-portal.svg?branch=master)](https://travis-ci.org/ccdl/resources-portal)
Portal for pediatric cancer researchers to discover and manage sharing of resources like cell lines, datasets, scientific code, etc.
[![Built with](https://img.shields.io/badge/Built_with-Cookiecutter_Django_Rest-F7B633.svg)](https://github.com/agconti/cookiecutter-django-rest)

Resources Portal. Check out the project's [documentation](http://ccdl.github.io/resources-portal/).

# Prerequisites

- [Docker](https://docs.docker.com/docker-for-mac/install/)

# Local Development

Start the dev server for local development:

```bash
docker-compose up
```

Run a command inside the docker container:

```bash
docker-compose run --rm web [command]
```
