# resources_portal

[![Build Status](https://travis-ci.org/ccdl/resources_portal.svg?branch=master)](https://travis-ci.org/ccdl/resources_portal)
Portal for pediatric cancer researchers to discover and manage sharing of resources like cell lines, datasets, scientific code, etc.
[![Built with](https://img.shields.io/badge/Built_with-Cookiecutter_Django_Rest-F7B633.svg)](https://github.com/agconti/cookiecutter-django-rest)

Resources Portal. Check out the project's [documentation](http://alexslemonade.github.io/resources-portal/).

## Prerequisites

- [Docker](https://docs.docker.com/docker-for-mac/install/)

## Local Development

Start the dev server for local development:

```bash
cd api && docker-compose up
```

See the [README for the API](api/README.md) for more information and commands.

`pre-commit` can run linting on all committed files for you automatically on every commit.
To enable this behavior, run `pre-commit install` in the root directory.
This will require installing `pre-commit` if you have not already done so.

## Cloud Development

Currently we do not have a staging or production stack, but a development stack can be deployed with the [infrastructure README](infrastructure/README.md)

## Testing

To populate the dev database with some realistic data, please run:

```bash
docker-compose run --rm api python3 manage.py populate_test_database
```

To clear the database, run:

```bash
./recreate_schema.sh
```

See the [README for the test data](api/dev_data/test_data_readme.md) for a description of the test dataset.
