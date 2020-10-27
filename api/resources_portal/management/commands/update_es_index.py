import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

import boto3
from django_elasticsearch_dsl.registries import registry
from elasticsearch_dsl.connections import connections
from requests_aws4auth import AWS4Auth

# We'll update for the past 30 minutes every 5 minutes.
UPDATE_WINDOW = datetime.timedelta(minutes=30)


def update_AWS_ES_auth():
    """AWS Elasticsearch creds expire.

    The elasticsearch DSL provides no mechanism to update them. This
    is a hack to do so. Since we're running this every five minutes
    anyway, it should prevent them from going out of date.
    """
    credentials = boto3.Session().get_credentials()
    aws_auth = AWS4Auth(
        credentials.access_key,
        credentials.secret_key,
        "us-east-1",
        "es",
        session_token=credentials.token,
    )
    connections._conns["default"].transport.get_connection().session.auth = aws_auth


class Command(BaseCommand):
    help = "Manage elasticsearch index."

    def handle(self, *args, **options):
        """This command is based off of the 'populate' command of Django ES DSL:

        https://github.com/sabricot/django-elasticsearch-dsl/blob/f6b2e0694e4ed69826c824196ccec5863874c856/django_elasticsearch_dsl/management/commands/search_index.py#L86

        We have updated it so that it will do incremental updates
        rather than looping over the full queryset every time.
        """
        update_AWS_ES_auth()

        models = set(registry.get_models())

        for doc in registry.get_documents(models):
            start_time = timezone.now() - UPDATE_WINDOW
            qs = doc().get_queryset().filter(updated_at__gt=start_time).order_by("id")
            self.stdout.write("Indexing {} '{}' objects".format(qs.count(), qs.model.__name__))
            doc().update(qs)
