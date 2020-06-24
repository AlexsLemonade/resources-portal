import os

import boto3
import requests

from resources_portal.config.common import Common


class Production(Common):
    INSTALLED_APPS = Common.INSTALLED_APPS
    SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
    # Site
    # https://docs.djangoproject.com/en/2.0/ref/settings/#allowed-hosts
    ALLOWED_HOSTS = ["*"]
    INSTALLED_APPS += ("gunicorn",)

    # https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching#cache-control
    # Response can be cached by browser and any intermediary caches (i.e. it is "public") for up to 1 day
    # 86400 = (60 seconds x 60 minutes x 24 hours)
    AWS_HEADERS = {
        "Cache-Control": "max-age=86400, s-maxage=86400, must-revalidate",
    }

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql_psycopg2",
            "NAME": os.getenv("DATABASE_NAME"),
            "USER": os.getenv("DATABASE_USER"),
            "PASSWORD": os.getenv("DATABASE_PASSWORD"),
            "HOST": os.getenv("DATABASE_HOST"),
            "PORT": os.getenv("DATABASE_PORT"),
        }
    }

    session = boto3.session.Session()
    credentials = session.get_credentials()
    # I don't know why there's no region here, but availability zone
    # minus a or b is the region! It's a bit of a hack but the
    # alternative is to pass the region into the app as an env var.
    region = requests.get(
        "http://169.254.169.254/latest/meta-data/placement/availability-zone"
    ).text[:-1]
    ELASTICSEARCH_DSL = {
        "default": {
            "hosts": os.getenv("ELASTICSEARCH_HOST", "elasticsearch"),
            "port": 443,
            "use_ssl": True,
        }
    }
