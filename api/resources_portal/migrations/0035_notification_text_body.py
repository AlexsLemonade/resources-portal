# Generated by Django 2.2.13 on 2020-09-18 13:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0034_materialrequest_is_active"),
    ]

    operations = [
        migrations.AddField(
            model_name="notification",
            name="text_body",
            field=models.TextField(editable=False, null=True),
        ),
    ]