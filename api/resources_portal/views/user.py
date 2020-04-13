from django.db import transaction
from rest_framework import mixins, serializers, viewsets
from rest_framework.permissions import AllowAny

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

from resources_portal.models import Organization, User
from resources_portal.models.documents import UserDocument
from resources_portal.permissions import IsUserOrReadOnly


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("username", "created_at", "updated_at")


class UserViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    Updates and retrieves user accounts
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsUserOrReadOnly,)


class CreateUserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        # call create_user on user object. Without this
        # the password will be stored in plain text.
        user = User.objects.create_user(**validated_data)
        return user

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "auth_token",
        )
        read_only_fields = ("auth_token",)
        extra_kwargs = {"password": {"write_only": True}}


class UserCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    Creates user accounts
    """

    queryset = User.objects.all()
    serializer_class = CreateUserSerializer
    permission_classes = (AllowAny,)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        response = super(UserCreateViewSet, self).create(request, args, kwargs)

        # Every user should have their own organization.
        user = User.objects.get(id=response.data["id"])
        Organization.objects.create(owner=user)

        return response


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
    filter_fields = {
        "id": {"field": "_id", "lookups": [LOOKUP_FILTER_RANGE, LOOKUP_QUERY_IN],},
    }

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

    def list(self, request, *args, **kwargs):
        response = super(UserDocumentView, self).list(request, args, kwargs)
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
