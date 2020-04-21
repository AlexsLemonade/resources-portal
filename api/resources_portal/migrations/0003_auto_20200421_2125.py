# Generated by Django 2.2.12 on 2020-04-21 21:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0002_organizationinvitation"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="organizationinvitation", options={"get_latest_by": "updated_at"},
        ),
        migrations.AddField(
            model_name="material",
            name="additional_info",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="material", name="citation", field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="material",
            name="contact_email",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="material",
            name="contact_name",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="material",
            name="embargo_date",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="material",
            name="import_source",
            field=models.CharField(
                choices=[
                    ("GEO", "GEO"),
                    ("SRA", "SRA"),
                    ("DBGAP", "DBGAP"),
                    ("DATASET", "DATASET"),
                    ("PROTOCOLS_IO", "PROTOCOLS_IO"),
                    ("ADDGENE", "ADDGENE"),
                    ("JACKSON_LAB", "JACKSON_LAB"),
                    ("ATCC", "ATCC"),
                    ("ZIRC_ZFIN", "ZIRC_ZFIN"),
                    ("OTHER", "OTHER"),
                ],
                max_length=32,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="material", name="organism", field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="material",
            name="pre_print_doi",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="material",
            name="pre_print_title",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="material",
            name="publication_title",
            field=models.TextField(blank=True, null=True),
        ),
    ]
