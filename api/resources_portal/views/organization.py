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

from resources_portal.models import Organization
from resources_portal.models.documents import OrganizationDocument
from resources_portal.views.user import UserSerializer


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "owner_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class OrganizationDetailSerializer(OrganizationSerializer):
    owner_id = UserSerializer()


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return OrganizationDetailSerializer

        return OrganizationSerializer


class OrganizationDocumentView(DocumentViewSet):
    document = OrganizationDocument
    serializer_class = OrganizationSerializer
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
        "name": {"boost": 10},
        # "owner_id"
    }

    # Define filtering fields
    filter_fields = {
        "id": {"field": "_id", "lookups": [LOOKUP_FILTER_RANGE, LOOKUP_QUERY_IN],},
        "name": "name",
    }

    # Define ordering fields
    ordering_fields = {
        "name": "name",
        "id": "id",
    }

    # Specify default ordering
    ordering = (
        "name",
        "id",
    )

    faceted_search_fields = {
        # "contact_user.username": {"field": "username", "facet": TermsFacet, "enabled": True,},
    }
    faceted_search_param = "facet"

    def list(self, request, *args, **kwargs):
        response = super(OrganizationDocumentView, self).list(request, args, kwargs)
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
