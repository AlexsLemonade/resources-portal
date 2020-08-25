# Generated by Django 2.2.13 on 2020-08-25 15:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0020_auto_20200821_1953"),
    ]

    operations = [
        migrations.RemoveField(model_name="materialrequest", name="is_active",),
        migrations.AlterField(
            model_name="materialrequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("OPEN", "OPEN"),
                    ("APPROVED", "APPROVED"),
                    ("IN_FULFILLMENT", "IN_FULFILLMENT"),
                    ("FULFILLED", "FULFILLED"),
                    ("VERIFIED_FULFILLED", "VERIFIED_FULFILLED"),
                    ("REJECTED", "REJECTED"),
                    ("INVALID", "INVALID"),
                    ("CANCELLED", "CANCELLED"),
                ],
                default="OPEN",
                max_length=32,
            ),
        ),
    ]
