from rest_framework import serializers, viewsets

from django_elasticsearch_dsl_drf.constants import (
    LOOKUP_FILTER_RANGE,
    LOOKUP_QUERY_GT,
    LOOKUP_QUERY_GTE,
    LOOKUP_QUERY_IN,
    LOOKUP_QUERY_LT,
    LOOKUP_QUERY_LTE,
    SUGGESTER_COMPLETION,
)
from django_elasticsearch_dsl_drf.filter_backends import (
    CompoundSearchFilterBackend,
    DefaultOrderingFilterBackend,
    FilteringFilterBackend,
    OrderingFilterBackend,
)
from django_elasticsearch_dsl_drf.pagination import LimitOffsetPagination as ESLimitOffsetPagination
from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet
from elasticsearch_dsl import TermsFacet
from six import iteritems

from resources_portal.models import Material
from resources_portal.models.documents import MaterialDocument
from resources_portal.views.user import UserSerializer


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = (
            "id",
            "category",
            "title",
            "url",
            "organization",
            "pubmed_id",
            "additional_metadata",
            "contact_user",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class MaterialDetailSerializer(MaterialSerializer):
    contact_user = UserSerializer()


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MaterialDetailSerializer

        return MaterialSerializer


class MaterialDocumentView(DocumentViewSet):
    document = MaterialDocument
    serializer_class = MaterialSerializer
    pagination_class = ESLimitOffsetPagination

    # Filter backends provide different functionality we want
    filter_backends = [
        FilteringFilterBackend,
        OrderingFilterBackend,
        DefaultOrderingFilterBackend,
        CompoundSearchFilterBackend,
    ]
    ordering = ("created_at",)
    lookup_field = "id"

    # Define search fields
    # Is this exhaustive enough?
    search_fields = {
        "title": {"boost": 10},
        "description": {"boost": 8},
        "contact_user": {"boost": 5},
        "organization": {"boost": 3},
        "url": None,
        "category": None,
        "pubmed_id": None,
        "additional_metadata": None,
    }

    # Define filtering fields
    filter_fields = {
        "id": {"field": "_id", "lookups": [LOOKUP_FILTER_RANGE, LOOKUP_QUERY_IN],},
        "category": "category",
        "organization": {"field": "name"},
        "title": "title",
    }

    # Define ordering fields
    ordering_fields = {
        "id": "id",
        "title": "title.raw",
        "category": "category.raw",
        "created_at": "created_at",
        "updated_at": "updated_at",
    }

    # Specify default ordering
    ordering = (
        "created_at",
        "id",
    )

    faceted_search_fields = {
        "category": {
            "field": "category",
            "facet": TermsFacet,
            "enabled": True,  # These are enabled by default, which is more expensive but more simple.
        },
        "contact_user.username": {"field": "username", "facet": TermsFacet, "enabled": True,},
        "organization.name": {
            "field": "organization",
            "facet": TermsFacet,
            "enabled": True,
            "global": False,
        },
    }
    faceted_search_param = "facet"

    def list(self, request, *args, **kwargs):
        response = super(MaterialDocumentView, self).list(request, args, kwargs)
        response.data["facets"] = self.transform_es_facets(response.data["facets"])
        return response

    def transform_es_facets(self, facets):
        """Transforms Elastic Search facets into a set of objects where each one corresponds
        to a filter group. Example:

        { technology: {rna-seq: 254, microarray: 8846, unknown: 0} }

        Which means the users could attach `?technology=rna-seq` to the url and expect 254
        samples returned in the results.
        """
        result = {}
        for field, facet in iteritems(facets):
            filter_group = {}
            for bucket in facet["buckets"]:
                filter_group[bucket["key"]] = bucket["total_samples"]["value"]
            result[field] = filter_group
        return result
