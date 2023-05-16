# resources_portal

[![Build Status](https://travis-ci.org/ccdl/resources_portal.svg?branch=master)](https://travis-ci.org/ccdl/resources_portal)
Portal for pediatric cancer researchers to discover and manage sharing of resources like cell lines, datasets, scientific code, etc.
[![Built with](https://img.shields.io/badge/Built_with-Cookiecutter_Django_Rest-F7B633.svg)](https://github.com/agconti/cookiecutter-django-rest)

Resources Portal. Check out the project's [documentation](http://alexslemonade.github.io/resources-portal/).

## Prerequisites

- [Docker](https://docs.docker.com/docker-for-mac/install/)

## Optional

You can run the `rportal` command with `./bin/rportal` from the root directory of this project.
Optionally you can add this project's `/bin` folder to your path and then call it directly.

## Local Development

Start the dev server for local development:

```bash
rportal  up
```

See the [README for the API](api/README.md) for more information and commands.

`pre-commit` can run linting on all committed files for you automatically on every commit.
To enable this behavior, run `pre-commit install` in the root directory.
This will require installing `pre-commit` if you have not already done so.

## Cloud Development

The staging stack will be redeployed upon every merge to dev.
The production stack has not yet been configured.

For instructions on how to deploy a development stack see the [infrastructure README](infrastructure/README.md).

## Testing

To populate the dev database with some realistic data, please run:

```bash
rportal populate-db
```

To clear the database, run:

```bash
rportal recreate-schema
```

See the [README for the test data](api/dev_data/test_data_readme.md) for a description of the test dataset.

<!--

## Account Creation

Users can create accounts by signing in through ORCID using the button in the website's header.
Accounts with associated grants can also be created by passing URL parameters to the /create-account endpoint, as documented in the [account creation README](client/ACCOUNT_CREATION_README.md).

## ORCID OAUTH

Resources Portal uses ORCID OAUTH to create accounts and sign in users. You can find documentation for it in the [OAUTH README](api/resources-portal/OAUTH_README.md).

-->
