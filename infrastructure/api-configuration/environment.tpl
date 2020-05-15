DJANGO_CONFIGURATION=Production
PORT=8081
DATABASE_HOST=${aws_db_instance.postgres_db.address}
ELASTICSEARCH_HOST="${aws_elasticsearch_domain.es.endpoint}"
