from json import dumps, loads

from django.utils.decorators import method_decorator
from rest_framework import serializers

from django_elasticsearch_dsl_drf.constants import LOOKUP_FILTER_RANGE, LOOKUP_QUERY_IN
from django_elasticsearch_dsl_drf.filter_backends import (
    CompoundSearchFilterBackend,
    DefaultOrderingFilterBackend,
    FacetedSearchFilterBackend,
    FilteringFilterBackend,
    OrderingFilterBackend,
    PostFilterFilteringFilterBackend,
)
from django_elasticsearch_dsl_drf.pagination import LimitOffsetPagination as ESLimitOffsetPagination
from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from elasticsearch_dsl import TermsFacet
from elasticsearch_dsl.query import Q
from six import iteritems

from resources_portal.models import Material, Organization, User
from resources_portal.models.documents import MaterialDocument, OrganizationDocument, UserDocument


# Puts material search data into a form that the client will accept
class MaterialDocumentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    category = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    url = serializers.CharField(read_only=True)
    pubmed_id = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    organisms = serializers.ListField(read_only=True)
    is_archived = serializers.BooleanField(read_only=True)
    has_publication = serializers.BooleanField(read_only=True)
    has_pre_print = serializers.BooleanField(read_only=True)
    additional_info = serializers.CharField(read_only=True)
    needs_mta = serializers.BooleanField(read_only=True)
    needs_irb = serializers.BooleanField(read_only=True)
    needs_abstract = serializers.BooleanField(read_only=True)
    publication_title = serializers.CharField(read_only=True)
    pre_print_doi = serializers.CharField(read_only=True)
    pre_print_title = serializers.CharField(read_only=True)
    citation = (serializers.CharField(read_only=True),)
    embargo_date = serializers.DateField(read_only=True)
    contact_user = serializers.SerializerMethodField(read_only=True)
    shipping_requirement = serializers.SerializerMethodField(read_only=True)
    organization = serializers.SerializerMethodField(read_only=True)
    mta_attachment = serializers.SerializerMethodField(read_only=True)
    additional_metadata = serializers.SerializerMethodField(read_only=True)
    imported = serializers.BooleanField(read_only=True)
    import_source = serializers.CharField(read_only=True)

    def get_contact_user(self, obj):
        return loads(dumps(obj.contact_user.to_dict()))

    def get_shipping_requirement(self, obj):
        return loads(dumps(obj.shipping_requirement.to_dict() or None))

    def get_organization(self, obj):
        return loads(dumps(obj.organization.to_dict()))

    def get_mta_attachment(self, obj):
        return loads(dumps(obj.mta_attachment.to_dict() or None))

    def get_additional_metadata(self, obj):
        return loads(obj.additional_metadata)

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
            "organisms",
            "is_archived",
            "has_publication",
            "has_pre_print",
            "additional_info",
            "publication_title",
            "pre_print_doi",
            "pre_print_title",
            "citation",
            "embargo_date",
            "contact_user",
            "imported",
            "import_source",
            "shipping_requirement",
        )


class MaterialFacetedSearchFilterBackend(FacetedSearchFilterBackend):
    """
    This is a modification to the FacetedSearchFilterBackend.
    The main difference is we don't want the search result filters to be too narrow.
    So we will only have the aggregates be filtered by the query params that are not for that aggregate.
    In order to support this move any filter you want to show extra aggreates to post_filter_fields so
    they aren't filtered out of the facet aggregations by default.

    So if we are calulating the aggregates for `category` we apply all filters from `organisms` etc
    but not the requested categories.
    """

    def aggregate(self, request, queryset, view):
        post_filter_fields = view.post_filter_fields.keys()
        query_params = request.query_params.copy()
        __facets = self.construct_facets(request, view)
        for __field, __facet in iteritems(__facets):
            agg = __facet["facet"].get_aggregation()
            agg_filter = Q("match_all")

            # loop over each query param and add to aggregate filter
            # skip if query param is aleady applied (if it is not in post filters)
            # skip if query param is the current facet aggregation
            for query_field in query_params:
                if query_field != __field and query_field in post_filter_fields:
                    query_values = query_params.getlist(query_field, [])
                    agg_filter = agg_filter + Q("terms", **{query_field: query_values})

            # add the aggregate to the queryset
            queryset.aggs.bucket("_filter_" + __field, "filter", filter=agg_filter).bucket(
                __field, agg
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
                name="organisms",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Allows filtering the results by organisms",
            ),
            openapi.Parameter(
                name="contact_user.email",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Allows filtering the results by the owner's email",
            ),
            openapi.Parameter(
                name="contact_user.published_name",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Allows filtering the results by the owner's published_name",
            ),
            openapi.Parameter(
                name="is_archived",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Allows filtering the results by is_archived",
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
            openapi.Parameter(
                name="organization.name",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Allows filtering the results by the name of the material's organization",
            ),
        ],
        operation_description="""
Use this endpoint to search among the materials.

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
class MaterialDocumentView(DocumentViewSet):
    """Defines search and filter fields for Materials"""

    document = MaterialDocument
    serializer_class = MaterialDocumentSerializer
    pagination_class = ESLimitOffsetPagination

    # Filter backends provide different functionality we want
    filter_backends = [
        FilteringFilterBackend,
        OrderingFilterBackend,
        DefaultOrderingFilterBackend,
        CompoundSearchFilterBackend,
        MaterialFacetedSearchFilterBackend,
        PostFilterFilteringFilterBackend,
    ]

    lookup_field = "id"

    # Define search fields
    search_fields = {
        "title": {"boost": 10},
        "category": None,
        "contact_user": None,
        "additional_metadata": None,
        "pubmed_id": None,
        "organisms": None,
        "additional_info": None,
        "contact_user.published_name": None,
        "publication_title": None,
        "pre_print_doi": None,
        "pre_print_title": None,
        "citation": None,
        "organization.name": None,
    }

    # Define filtering fields
    filter_fields = {
        "id": {
            "field": "_id",
            "lookups": [LOOKUP_FILTER_RANGE, LOOKUP_QUERY_IN],
        },
        "organization": {"field": "organization.name"},
        "title": "title",
        "is_archived": "is_archived",
        "contact_user.email": "contact_user.email",
        "contact_user.published_name": "contact_user.published_name",
    }

    # Define post filter fields
    post_filter_fields = {
        "category": {"field": "category"},
        "organisms": {"field": "organisms"},
        "has_publication": {"field": "has_publication"},
        "has_pre_print": {"field": "has_pre_print"},
    }

    # Define ordering fields
    ordering_fields = {
        "is_archived": "is_archived",
        "id": "id",
        "title": "title.raw",
        "category": "category.raw",
        "created_at": "created_at",
        "updated_at": "updated_at",
    }

    # Specify default ordering
    ordering = (
        "_score",
        "is_archived",
        "updated_at",
        "id",
    )

    faceted_search_fields = {
        "category": {"field": "category", "facet": TermsFacet, "enabled": True},
        "organisms": {"field": "organisms", "facet": TermsFacet, "enabled": True},
        "contact_user.email": {"field": "contact_user.email", "facet": TermsFacet, "enabled": True},
        "contact_user.published_name": {
            "field": "contact_user.published_name",
            "facet": TermsFacet,
            "enabled": True,
        },
        "is_archived": {"field": "is_archived", "facet": TermsFacet, "enabled": True},
        "has_publication": {"field": "has_publication", "facet": TermsFacet, "enabled": True},
        "has_pre_print": {"field": "has_pre_print", "facet": TermsFacet, "enabled": True},
        "organization": {"field": "organization.name", "facet": TermsFacet, "enabled": True},
    }
    faceted_search_param = "facet"

    def list(self, request, *args, **kwargs):
        response = super(MaterialDocumentView, self).list(request, args, kwargs)
        response.data["facets"] = self.transform_es_facets(response.data["facets"])
        return response

    def transform_es_facets(self, facets):
        """Transforms Elastic Search facets into a set of objects where each one corresponds
        to a filter group. Example:

        "category": {
            "DATASET": 4,
            "MODEL_ORGANISM": 4,
            "CELL_LINE": 2,
            "OTHER": 2,
            "PLASMID": 2,
            "PROTOCOL": 2,
            "PDX": 1
        }

        Which means the users could attach `?category=DATASET` to the url and expect 4
        datasets returned in the results.
        """
        result = {}
        for field, facet in iteritems(facets):
            filter_group = {}
            fieldName = field.replace("_filter_", "")
            for bucket in facet[fieldName]["buckets"]:
                filter_group[bucket["key"]] = bucket["doc_count"]
            result[fieldName] = filter_group
        return result


class OrganizationDocumentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    owner = serializers.SerializerMethodField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_owner(self, obj):
        return loads(dumps(obj.owner.to_dict()))

    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "owner",
            "created_at",
            "updated_at",
        )


class OrganizationDocumentView(DocumentViewSet):
    """Defines search and filter fields for Organizations"""

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
    search_fields = {
        "name": {"boost": 10},
        "owner.first_name": None,
        "owner.last_name": None,
        "owner.published_name": None,
        "owner.email": None,
    }

    # Define filtering fields
    filter_fields = {}

    # Define ordering fields
    ordering_fields = {
        "name": "name",
        "id": "id",
    }

    # Specify default ordering
    ordering = ("_score", "updated_at")

    faceted_search_fields = {}

    faceted_search_param = "facet"


class UserDocumentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    published_name = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "published_name",
            "full_name",
            "email",
            "created_at",
            "updated_at",
        )


class UserDocumentView(DocumentViewSet):
    """Defines search and filter fields for Users"""

    document = UserDocument
    serializer_class = UserDocumentSerializer
    pagination_class = ESLimitOffsetPagination

    # Filter backends provide different functionality we want
    filter_backends = [
        FilteringFilterBackend,
        OrderingFilterBackend,
        DefaultOrderingFilterBackend,
        CompoundSearchFilterBackend,
    ]
    ordering = (
        "_score",
        "updated_at",
    )
    lookup_field = "id"

    # Define search fields
    search_fields = {
        "email": {"boost": 9},
        "last_name": {"boost": 8},
        "first_name": {"boost": 7},
        "published_name": {"boost": 4},
    }

    # Define filtering fields
    filter_fields = {}

    # Define ordering fields
    ordering_fields = {"id": "id", "published_name": "published_name"}

    faceted_search_fields = {}
    faceted_search_param = "facet"
