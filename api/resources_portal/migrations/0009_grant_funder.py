# Generated by Django 2.2.13 on 2021-01-22 16:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0008_auto_20201210_1930"),
    ]

    operations = [
        migrations.AddField(
            model_name="grant",
            name="funder",
            field=models.CharField(default="ALSF", max_length=80),
        ),
    ]
