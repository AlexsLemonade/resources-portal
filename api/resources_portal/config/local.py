import os

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

    # OAuth
    OAUTH_URL = "https://sandbox.orcid.org/oauth/token"

    # CORS
    CORS_ORIGIN_WHITELIST = [
        "http://localhost:7000",
        "http://127.0.0.1:7000",
    ]

    CSRF_TRUSTED_ORIGINS = ["localhost", "127.0.0.1"]
