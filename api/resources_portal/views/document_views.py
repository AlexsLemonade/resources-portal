from django.utils.decorators import method_decorator
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
    FacetedSearchFilterBackend,
    FilteringFilterBackend,
    OrderingFilterBackend,
)
from django_elasticsearch_dsl_drf.pagination import LimitOffsetPagination as ESLimitOffsetPagination
from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from elasticsearch_dsl import TermsFacet
from six import iteritems

from resources_portal.models import Material, Organization, User
from resources_portal.models.documents import MaterialDocument, OrganizationDocument, UserDocument
from resources_portal.views.organization import OrganizationSerializer
from resources_portal.views.user import UserSerializer


# Puts material search data into a form that the client will accept
class MaterialDocumentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    category = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    url = serializers.CharField(read_only=True)
    pubmed_id = serializers.CharField(read_only=True)
    additional_metadata = serializers.CharField(read_only=True)
    created_at = serializers.DateField(read_only=True)
    updated_at = serializers.DateField(read_only=True)
    organism = serializers.CharField(read_only=True)
    has_publication = serializers.CharField(read_only=True)
    has_pre_print = serializers.CharField(read_only=True)

    class Meta:
        model = Material
        fields = (
            "id",
            "category",
            "title",
            "url",
            "pubmed_id",
            "additional_metadata",
            "created_at",
            "updated_at",
            "organism",
            "has_publication",
            "has_pre_print",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class FacetedSearchFilterBackendExtended(FacetedSearchFilterBackend):
    def aggregate(self, request, queryset, view):
        """Extends FacetedSearchFilterBackend to add additional metrics to each bucket
        https://github.com/barseghyanartur/django-elasticsearch-dsl-drf/blob/master/src/django_elasticsearch_dsl_drf/filter_backends/faceted_search.py#L19

        We have the downloadable sample accession codes indexed for each experiment.
        The cardinality metric, returns the number of unique samples for each bucket.
        However it's just an approximate
        https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-cardinality-aggregation.html#_counts_are_approximate
        I used the highest possible precision threshold, but this might increase the amount
        of memory used.
        """
        facets = self.construct_facets(request, view)
        for field, facet in iteritems(facets):
            agg = facet["facet"].get_aggregation()
            queryset.aggs.bucket(field, agg).metric(
                "total_samples", "cardinality", field="id", precision_threshold=40000,
            )
        return queryset


##
# ElasticSearch powered Search and Filter
##
@method_decorator(
    name="list",
    decorator=swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                name="category",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Allows filtering the results by category, can have multiple values. Eg: `?category=plasmid&category=other`",
            ),
            openapi.Parameter(
                name="organism",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Allows filtering the results by organism",
            ),
            openapi.Parameter(
                name="has_publication",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Allows filtering the results by has_publication",
            ),
            openapi.Parameter(
                name="has_pre_print",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Allows filtering the results by has_pre_print",
            ),
        ],
        operation_description="""
Use this endpoint to search among the experiments.

This is powered by ElasticSearch, information regarding advanced usages of the
filters can be found in the [Django-ES-DSL-DRF docs](https://django-elasticsearch-dsl-drf.readthedocs.io/en/0.17.1/filtering_usage_examples.html#filtering)

There's an additional field in the response named `facets` that contain stats on the number of results per filter type.

Example Requests:
```
?search=zebrafish
?id=1
?search=zebrafish&category=plasmid&has_publication=true
?ordering=source_first_published
```
""",
    ),
)

# Defines search and filter fields for Materials
class MaterialDocumentView(DocumentViewSet):
    document = MaterialDocument
    serializer_class = MaterialDocumentSerializer
    pagination_class = ESLimitOffsetPagination

    # Filter backends provide different functionality we want
    filter_backends = [
        FilteringFilterBackend,
        OrderingFilterBackend,
        DefaultOrderingFilterBackend,
        CompoundSearchFilterBackend,
        FacetedSearchFilterBackendExtended,
    ]
    lookup_field = "id"

    # Define search fields
    # Is this exhaustive enough?
    search_fields = {
        "title": {"boost": 10},
        "category": None,
        "additional_metadata": None,
        "pubmed_id": None,
        "organism": None,
    }

    # Define filtering fields
    filter_fields = {
        "id": {"field": "_id", "lookups": [LOOKUP_FILTER_RANGE, LOOKUP_QUERY_IN],},
        "category": "category",
        "organization": {"field": "name"},
        "title": "title",
        "organism": "organism",
        "has_publication": "has_publication",
        "has_pre_print": "has_pre_print",
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
        "_score",
        "created_at",
        "id",
    )

    faceted_search_fields = {
        "category": {"field": "category", "facet": TermsFacet, "enabled": True},
        "organism": {"field": "organism", "facet": TermsFacet, "enabled": True},
        "has_publication": {"field": "has_publication", "facet": TermsFacet, "enabled": True},
        "has_pre_print": {"field": "has_pre_print", "facet": TermsFacet, "enabled": True},
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


class OrganizationDocumentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    owner_id = serializers.CharField(read_only=True)
    created_at = serializers.DateField(read_only=True)
    updated_at = serializers.DateField(read_only=True)

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


class OrganizationDocumentView(DocumentViewSet):
    document = OrganizationDocument
    serializer_class = OrganizationDocumentSerializer
    pagination_class = ESLimitOffsetPagination

    # Filter backends provide different functionality we want
    filter_backends = [
        FilteringFilterBackend,
        OrderingFilterBackend,
        DefaultOrderingFilterBackend,
        CompoundSearchFilterBackend,
    ]

    lookup_field = "id"

    # Define search fields
    # Is this exhaustive enough?
    search_fields = {"name": {"boost": 10}}

    # Define filtering fields
    filter_fields = {}

    # Define ordering fields
    ordering_fields = {
        "name": "name",
        "id": "id",
    }

    # Specify default ordering
    ordering = ("_score", "created_at")

    faceted_search_fields = {}

    faceted_search_param = "facet"


class UserDocumentView(DocumentViewSet):
    document = UserDocument
    serializer_class = UserSerializer
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
        "username": {"boost": 10},
        "last_name": {"boost": 8},
        "first_name": {"boost": 7},
    }

    # Define filtering fields
    filter_fields = {}

    # Define ordering fields
    ordering_fields = {
        "username": "username",
        "id": "id",
    }

    # Specify default ordering
    ordering = (
        "username",
        "id",
    )

    faceted_search_fields = {}
    faceted_search_param = "facet"
