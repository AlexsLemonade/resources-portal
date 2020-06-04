# Generated by Django 2.2.12 on 2020-06-04 20:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="materialrequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "PENDING"),
                    ("APPROVED", "APPROVED"),
                    ("REJECTED", "REJECTED"),
                    ("INVALID", "INVALID"),
                    ("CANCELLED", "CANCELLED"),
                ],
                default="PENDING",
                max_length=32,
            ),
        ),
    ]
