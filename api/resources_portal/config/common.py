import os
from distutils.util import strtobool
from os.path import join

import dj_database_url
from configurations import Configuration

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Common(Configuration):

    INSTALLED_APPS = (
        "django.contrib.admin",
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.staticfiles",
        # Third party apps
        "django_extensions",
        "rest_framework",  # utilities for rest apis
        "rest_framework.authtoken",  # token authentication
        "django_filters",  # for filtering rest endpoints
        "guardian",  # extended permissions to individual objects
        "django_elasticsearch_dsl",  # elasticsearch
        "django_elasticsearch_dsl_drf",  # elasticsearch rest api
        "drf_yasg",
        "computedfields",  # Allows for computed fields on models
        "safedelete",  # soft-deletes objects
        "corsheaders",
        # Your apps
        "resources_portal",
    )

    # https://docs.djangoproject.com/en/2.0/topics/http/middleware/
    MIDDLEWARE = (
        "corsheaders.middleware.CorsMiddleware",
        "django.middleware.security.SecurityMiddleware",
        "django.contrib.sessions.middleware.SessionMiddleware",
        "django.middleware.common.CommonMiddleware",
        "django.middleware.csrf.CsrfViewMiddleware",
        "django.contrib.auth.middleware.AuthenticationMiddleware",
        "django.contrib.messages.middleware.MessageMiddleware",
        "django.middleware.clickjacking.XFrameOptionsMiddleware",
        "resources_portal.middleware.oauth.OAuthMiddleWare",
    )

    ALLOWED_HOSTS = ["*"]
    ROOT_URLCONF = "resources_portal.urls"
    SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
    WSGI_APPLICATION = "resources_portal.wsgi.application"

    # OAuth
    CLIENT_SECRET = os.getenv("OAUTH_CLIENT_SECRET")
    CLIENT_ID = "APP-2AHZAK2XCFGHRJFM"

    # Email
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

    ADMINS = (("Author", "ccdl@alexslemonade.org"),)

    # Postgres
    DATABASES = {
        "default": dj_database_url.config(
            default="postgres://postgres:@postgres:5432/postgres",
            conn_max_age=int(os.getenv("POSTGRES_CONN_MAX_AGE", 600)),
        )
    }

    # General
    APPEND_SLASH = True
    TIME_ZONE = "UTC"
    LANGUAGE_CODE = "en-us"
    # If you set this to False, Django will make some optimizations so as not
    # to load the internationalization machinery.
    USE_I18N = False
    USE_L10N = True
    USE_TZ = True
    LOGIN_REDIRECT_URL = "/"

    # Static files (CSS, JavaScript, Images)
    # https://docs.djangoproject.com/en/2.0/howto/static-files/
    STATIC_ROOT = "/tmp/www/static/"
    STATICFILES_DIRS = []
    STATIC_URL = "/static/"
    STATICFILES_FINDERS = (
        "django.contrib.staticfiles.finders.FileSystemFinder",
        "django.contrib.staticfiles.finders.AppDirectoriesFinder",
    )

    # Media files
    MEDIA_ROOT = join(os.path.dirname(BASE_DIR), "media")
    MEDIA_URL = "/media/"

    TEMPLATES = [
        {
            "BACKEND": "django.template.backends.django.DjangoTemplates",
            "DIRS": STATICFILES_DIRS,
            "APP_DIRS": True,
            "OPTIONS": {
                "context_processors": [
                    "django.template.context_processors.debug",
                    "django.template.context_processors.request",
                    "django.contrib.auth.context_processors.auth",
                    "django.contrib.messages.context_processors.messages",
                ],
            },
        },
    ]

    # Set DEBUG to False as a default for safety
    # https://docs.djangoproject.com/en/dev/ref/settings/#debug
    DEBUG = strtobool(os.getenv("DJANGO_DEBUG", "no"))

    # Password Validation
    # https://docs.djangoproject.com/en/2.0/topics/auth/passwords/#module-django.contrib.auth.password_validation
    AUTH_PASSWORD_VALIDATORS = [
        {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",},
        {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",},
        {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",},
        {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",},
    ]

    # Elastic Search
    ELASTICSEARCH_DSL = {
        "default": {
            "hosts": os.getenv("ELASTICSEARCH_HOST", "elasticsearch")
            + ":"
            + os.getenv("ELASTICSEARCH_PORT", "9200")
        }
    }

    # Logging
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "django.server": {
                "()": "django.utils.log.ServerFormatter",
                "format": "[%(server_time)s] %(message)s",
            },
            "verbose": {
                "format": "%(asctime)s %(levelname)s %(module)s %(process)d %(thread)d %(message)s"
            },
            "simple": {"format": "%(asctime)s %(levelname)s %(message)s"},
        },
        "filters": {"require_debug_true": {"()": "django.utils.log.RequireDebugTrue",},},
        "handlers": {
            "django.server": {
                "level": "INFO",
                "class": "logging.StreamHandler",
                "formatter": "django.server",
            },
            "console": {"level": "DEBUG", "class": "logging.StreamHandler", "formatter": "simple",},
            "mail_admins": {"level": "ERROR", "class": "django.utils.log.AdminEmailHandler",},
        },
        "loggers": {
            "django": {"handlers": ["console"], "propagate": True,},
            "django.server": {"handlers": ["django.server"], "level": "INFO", "propagate": False,},
            "django.request": {
                "handlers": ["mail_admins", "console"],
                "level": "ERROR",
                "propagate": False,
            },
            "django.db.backends": {"handlers": ["console"], "level": "INFO"},
        },
    }

    # Custom user app
    AUTH_USER_MODEL = "resources_portal.User"

    # Django Rest Framework
    REST_FRAMEWORK = {
        "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
        "PAGE_SIZE": int(os.getenv("DJANGO_PAGINATION_LIMIT", 10)),
        "DATETIME_FORMAT": "%Y-%m-%dT%H:%M:%S%z",
        "TEST_REQUEST_DEFAULT_FORMAT": "json",
        "DEFAULT_RENDERER_CLASSES": (
            "rest_framework.renderers.JSONRenderer",
            "rest_framework.renderers.BrowsableAPIRenderer",
        ),
        "DEFAULT_PERMISSION_CLASSES": [
            # 'rest_framework.permissions.IsAuthenticated',
        ],
        "DEFAULT_AUTHENTICATION_CLASSES": (
            "rest_framework.authentication.SessionAuthentication",
            "rest_framework.authentication.TokenAuthentication",
        ),
    }

    # Custom permissions with django-guard
    AUTHENTICATION_BACKENDS = (
        "django.contrib.auth.backends.ModelBackend",  # default
        "guardian.backends.ObjectPermissionBackend",
    )
