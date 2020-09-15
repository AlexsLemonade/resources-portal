"""Serializers should only be added to this module instead of
resources_portal.views if it is necessary to prevent a cyclical
dependency."""

from resources_portal.serializers.material import MaterialDetailSerializer, MaterialSerializer
