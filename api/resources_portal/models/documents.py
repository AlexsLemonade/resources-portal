from django_elasticsearch_dsl import Document, Index, fields
from elasticsearch_dsl import analyzer
from elasticsearch_dsl.analysis import token_filter

from resources_portal.models import Material

material_index = Index("materials")

material_index.settings(number_of_shards=1, number_of_replicas=0)


@material_index.doc_type
class MaterialDocument(Document):
    """ Our Material ElasticSearch Document, which
    corresponds to our Material model. """

    title = fields.TextField(fielddata=True, fields={"raw": fields.KeywordField()})
    category = fields.TextField(fielddata=True, fields={"raw": fields.KeywordField()})
    contact_user = fields.TextField(
        properties={
            "first_name": fields.TextField(),
            "last_name": fields.TextField(),
            "username": fields.TextField(),
        }
    )
    organization = fields.TextField(properties={"name": fields.TextField(),})

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

    def prepare_material_category(self, material):
        cleaned_category_label = material.category.replace("_", " ")

    class Django:
        model = Material
        parallel_indexing = True
        queryset_pagination = 3000

        fields = ["id"]

    def get_queryset(self):
        return super().get_queryset().select_related("")
