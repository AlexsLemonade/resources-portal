import os
import sys

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

from resources_portal.config.common import Common

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Local(Common):
    DEBUG = True

    # Mail
    EMAIL_HOST = "localhost"
    EMAIL_PORT = 1025
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

    ELASTICSEARCH_HOST = "elasticsearch"
    ELASTICSEARCH_PORT = 9200

    # AWS
    AWS_REGION = None

    # AWS Simple Email Service
    AWS_SES_DOMAIN = None

    # AWS S3
    AWS_S3_BUCKET_NAME = None

    # Local handling of uploaded files.
    TESTING = "test" in sys.argv

    if TESTING:
        LOCAL_FILE_DIRECTORY = "/home/user/code/test_uploaded_files"
    else:
        LOCAL_FILE_DIRECTORY = "/home/user/code/uploaded_files"

    if not os.path.exists(LOCAL_FILE_DIRECTORY):
        os.mkdir(LOCAL_FILE_DIRECTORY)

    # OAuth
    OAUTH_URL = "https://sandbox.orcid.org/oauth/token"

    CSRF_TRUSTED_ORIGINS = ["localhost", "127.0.0.1"]

    # This is only needed locally because everything else will use S3.
    DEV_HOST = os.getenv("DEV_HOST")

    sentry_sdk.init(
        dsn="https://dd7bd76d825c43f9a987040bd1a04e4b@o7983.ingest.sentry.io/5454557",
        integrations=[DjangoIntegration()],
        traces_sample_rate=1.0,
        # If you wish to associate users to errors (assuming you are using
        # django.contrib.auth) you may enable sending PII data.
        send_default_pii=True,
        debug=True,
    )
