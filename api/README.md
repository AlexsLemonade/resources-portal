# Resources Portal API

All commands from this README should be run from the `api/` directory.

## Local Development

Start the dev server for local development:

```bash
docker-compose up
```

Run a command inside the docker container:

```bash
docker-compose run --rm api [command]
```

i.e. the tests:

```
docker-compose run --rm api ./run_tests.sh
```

The dev server runs by default on port 8000 with the docs being served at 8001.
If these ports are already in use on your local machine, you can run them at different ports with:

```bash
PORT=8002 DOCS_PORT=8003 docker-compose run --rm api [command]
```

A postgres commmand line client can be started by running:

```
./run_psql_client.sh
```

## Example Local Requests

You can use this to make a curl request to the API like so:

```
curl -X POST http://0.0.0.0:8000/v1/users -H "Content-Type: application/json" -d '{"username": "crazyparklady", "password": "i<3parks", "first_name": "Leslie", "last_name": "Knope", "email": "lknope@parks.pawneeindiana.gov"}'
```

The response to creating a user will contain an id, which can be used to replace `<USER_ID>` in the following request to create a material:

```
curl -X POST http://0.0.0.0:8000/v1/materials -H "Content-Type: application/json" -d '{"category": "CELL_LINE", "url": "https://www.atcc.org/products/all/HTB-38.aspx", "contact_user": "<USER_ID>", "organization": 1}'
```

(Note that you may want to change `organization` as well.)

## Elasticsearch Queries

You can search the test database using elasticsearch. Go to
```http://localhost:8000/search/materials```

to see a list of all materials. Other searches you can do include:

```http://localhost:8000/search/materials?search=PrimProf```
Finds all materials with the term "PrimProf" somewhere in the data.

```http://localhost:8000/search/materials?category=PLASMID```
Filter for all materials with under the category "PLASMID"

```http://localhost:8000/search/materials?ordering=created_at```
Order the searches by their time created. Default ordering is best match.

These queries can also be combined, like:
```http://localhost:8000/search/materials?ordering=created_at&category=PLASMID&search=zebrafish```

## Cloud Deployments

To be able to deploy the API to AWS the docker image will need to be hosted in a Docker repository.
To deploy a dev stack you will need your own Docker repository to repalce `<DOCKER_REPO>` with:

```
docker build -t <DOCKER_REPO>/resources_portal_api:v0.0.0 --build-arg SYSTEM_VERSION=v0.0.0 . && docker push <DOCKER_REPO>/resources_portal_api:v0.0.0
```

That command needs to be run from the `api/` directory, but the rest of the deployment should be run from `infrastructure/` directory.
Therefore the directions for doing so are in the [infrastructure README](../infrastructure/README.md).

Once you have completed a deploy you can replace with `0.0.0.0:8000` in the requests above with the `elastic_ip_address` output by terraform.
