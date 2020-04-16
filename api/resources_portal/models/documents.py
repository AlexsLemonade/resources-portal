from django_elasticsearch_dsl import Document, Index, fields
from elasticsearch_dsl import analyzer
from elasticsearch_dsl.analysis import token_filter

from resources_portal.models import Material, Organization, User

material_index = Index("materials")
organization_index = Index("organizations")
user_index = Index("resources_portal_user")

material_index.settings(number_of_shards=1, number_of_replicas=0)
organization_index.settings(number_of_shards=1, number_of_replicas=0)
user_index.settings(number_of_shards=1, number_of_replicas=0)

html_strip = analyzer(
    "html_strip",
    tokenizer="standard",
    filter=["lowercase", "stop", "snowball"],
    char_filter=["html_strip"],
)

# Document for materials. Interprets material data from the model so that it can be indexed into elasticsearch.
@material_index.doc_type
class MaterialDocument(Document):

    title = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )
    category = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )

    organism = fields.TextField(
        attr="get_organism",
        fielddata=True,
        analyzer=html_strip,
        fields={"raw": fields.KeywordField()},
    )

    has_publication = fields.BooleanField(attr="has_publication")

    has_pre_print = fields.BooleanField(attr="has_pre_print")

    # Basic Fields
    id = fields.IntegerField()
    url = fields.TextField()
    mta_s3_url = fields.TextField()
    needs_irb = fields.BooleanField()
    needs_mta = fields.BooleanField()
    needs_abstract = fields.BooleanField()
    pubmed_id = fields.TextField()
    created_at = fields.DateField()
    updated_at = fields.DateField()
    additional_metadata = fields.TextField()

    def prepare_additional_metadata(self, instance):
        metadata_string = str(instance.additional_metadata)
        metadata_string = metadata_string.strip("{")
        metadata_string = metadata_string.strip("}")
        return metadata_string

    class Django:
        model = Material
        parallel_indexing = True
        queryset_pagination = 3000


# Document for organizations. Interprets organization data from the model so that it can be indexed into elasticsearch.
@organization_index.doc_type
class OrganizationDocument(Document):

    name = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )

    # Basic Fields
    id = fields.IntegerField()
    created_at = fields.DateField()
    updated_at = fields.DateField()

    class Django:
        model = Organization
        parallel_indexing = True
        queryset_pagination = 3000


# Document for users. Interprets user data from the model so that it can be indexed into elasticsearch.
@user_index.doc_type
class UserDocument(Document):

    first_name = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )
    last_name = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )
    username = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )
    email = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )
    # Basic Fields
    created_at = fields.DateField()
    updated_at = fields.DateField()
    date_joined = fields.DateField()
    id = fields.TextField(fielddata=True)

    class Django:
        model = User
        parallel_indexing = True
        queryset_pagination = 3000
