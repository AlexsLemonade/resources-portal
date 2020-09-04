from django.apps import AppConfig


class ResourcesPortalConfig(AppConfig):
    name = "resources_portal"

    # This will be called multiple times
    def ready(self):
        import resources_portal.signals


default_app_config = "resources_portal.ResourcesPortalConfig"
