import os

from resources_portal.config.common import Common


class Production(Common):
    INSTALLED_APPS = Common.INSTALLED_APPS
    SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
    # Site
    # https://docs.djangoproject.com/en/2.0/ref/settings/#allowed-hosts
    ALLOWED_HOSTS = ["*"]
    INSTALLED_APPS += ("gunicorn",)

    # OAuth
    OAUTH_URL = os.getenv("OAUTH_URL")

    # AWS
    AWS_REGION = os.getenv("AWS_REGION")

    # AWS Simple Email Service
    AWS_SES_DOMAIN = os.getenv("AWS_SES_DOMAIN")

    # AWS S3
    AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")

    # Only used locally, make sure it is None.
    LOCAL_FILE_DIRECTORY = None

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

    ELASTICSEARCH_DSL = {
        "default": {
            "hosts": os.getenv("ELASTICSEARCH_HOST", "elasticsearch"),
            "port": 443,
            "use_ssl": True,
        }
    }
