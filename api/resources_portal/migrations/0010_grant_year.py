# Generated by Django 2.2.13 on 2021-02-09 15:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0009_grant_funder"),
    ]

    operations = [
        migrations.AddField(
            model_name="grant",
            name="year",
            field=models.PositiveSmallIntegerField(null=True),
        ),
    ]
