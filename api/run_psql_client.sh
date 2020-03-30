#! /bin/sh
docker run  --network api_default -it -e PGPASSWORD=mysecretpassword --rm --link api_postgres_1:postgres postgres:9.6.6 psql -h postgres -U postgres -d postgres
