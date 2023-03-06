import json

from django_elasticsearch_dsl import Document, Index, fields
from elasticsearch_dsl import analyzer

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

string_analyzer = analyzer(
    "string_analyzer",
    tokenizer="keyword",
    filter=["lowercase", "stop", "snowball"],
)

no_op_analyzer = analyzer(
    "no_op_analyzer",
    tokenizer="keyword",
    filter=[],
)


# Document for materials. Interprets material data from the model so that it can be indexed into elasticsearch.
@material_index.doc_type
class MaterialDocument(Document):

    title = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )
    category = fields.KeywordField()

    organisms = fields.ListField(
        fields.TextField(
            fielddata=True, analyzer=string_analyzer, fields={"raw": fields.KeywordField()}
        )
    )

    contact_user = fields.ObjectField(
        properties={
            "first_name": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "last_name": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "published_name": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "email": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
        }
    )

    organization = fields.ObjectField(
        properties={
            "name": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "id": fields.IntegerField(),
        }
    )

    shipping_requirement = fields.ObjectField(
        properties={
            "needs_shipping_address": fields.BooleanField(),
            "needs_payment": fields.BooleanField(),
            "accepts_shipping_code": fields.BooleanField(),
            "accepts_reimbursement": fields.BooleanField(),
            "accepts_other_payment_methods": fields.BooleanField(),
            "accepted_payment_details": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "restrictions": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "created_at": fields.DateField(),
            "updated_at": fields.DateField(),
        }
    )

    mta_attachment = fields.ObjectField(
        properties={
            "filename": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "description": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "s3_bucket": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "s3_key": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "download_url": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "created_at": fields.DateField(),
            "updated_at": fields.DateField(),
        }
    )

    has_publication = fields.BooleanField(attr="has_publication")

    has_pre_print = fields.BooleanField(attr="has_pre_print")

    # Basic Fields
    id = fields.IntegerField()
    url = fields.TextField()
    is_archived = fields.BooleanField()
    needs_irb = fields.BooleanField()
    needs_mta = fields.BooleanField()
    needs_abstract = fields.BooleanField()
    pubmed_id = fields.TextField()
    created_at = fields.DateField()
    updated_at = fields.DateField()
    additional_metadata = fields.TextField()
    imported = fields.BooleanField()
    import_source = fields.TextField()

    publication_title = fields.TextField()
    pre_print_doi = fields.TextField()
    pre_print_title = fields.TextField()
    citation = fields.TextField()
    additional_info = fields.TextField()
    embargo_date = fields.DateField()

    def prepare_additional_metadata(self, instance):
        return json.dumps(instance.additional_metadata)

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

    owner = fields.ObjectField(
        properties={
            "first_name": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "last_name": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "published_name": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
            "email": fields.TextField(fielddata=True, analyzer=no_op_analyzer),
        }
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
    published_name = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )
    full_name = fields.TextField(
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
