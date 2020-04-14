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


@material_index.doc_type
class MaterialDocument(Document):

    title = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )
    category = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )
    contact_user = fields.ObjectField(properties={"username": fields.TextField()})

    organization = fields.ObjectField(properties={"name": fields.TextField()})

    # Basic Fields
    url = fields.TextField()
    mta_s3_url = fields.TextField()
    needs_irb = fields.BooleanField()
    needs_mta = fields.BooleanField()
    needs_abstract = fields.BooleanField()
    pubmed_id = fields.IntegerField()
    created_at = fields.DateField()
    updated_at = fields.DateField()
    additional_metadata = fields.TextField()

    class Django:
        model = Material
        parallel_indexing = True
        queryset_pagination = 3000

        fields = ["id"]
        related_models = [User, Organization]

    def get_queryset(self):
        return (
            super(MaterialDocument, self)
            .get_queryset()
            .select_related("contact_user", "organization")
        )

    def get_instances_from_related(self, related_instance):
        return related_instance.material_set.all()


@organization_index.doc_type
class OrganizationDocument(Document):

    name = fields.TextField(
        fielddata=True, analyzer=html_strip, fields={"raw": fields.KeywordField()}
    )

    # Basic Fields
    created_at = fields.DateField()
    updated_at = fields.DateField()

    class Django:
        model = Organization
        parallel_indexing = True
        queryset_pagination = 3000

        fields = ["id"]


@user_index.doc_type
class UserDocument(Document):

    owner_id = fields.TextField()
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
    id = fields.TextField()

    class Django:
        model = User
        parallel_indexing = True
        queryset_pagination = 3000

    def get_queryset(self):
        return super(UserDocument, self).get_queryset().select_related("owner")

    def get_instances_from_related(self, related_instance):
        return related_instance.Organization
