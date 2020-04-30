# Generated by Django 2.2.12 on 2020-04-30 18:10

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0003_auto_20200424_1937"),
    ]

    operations = [
        migrations.CreateModel(
            name="ShippingInformation",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("needs_shipping_address", models.BooleanField(default=False)),
                ("sharer_pays", models.BooleanField(default=False)),
                ("ups_code_accepted", models.BooleanField(default=False)),
                ("fedex_code_accepted", models.BooleanField(default=False)),
                ("reimbursement_accepted", models.BooleanField(default=False)),
                ("other_payment_methods_accepted", models.BooleanField(default=False)),
                ("restrictions", models.TextField(blank=True, null=True)),
                ("deleted", models.BooleanField(default=False)),
            ],
            options={"db_table": "shipping_information", "get_latest_by": "created_at",},
        ),
        migrations.RemoveField(model_name="material", name="needs_shipping_info",),
        migrations.AlterField(
            model_name="material",
            name="embargo_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="material",
            name="shipping_information",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="resources_portal.ShippingInformation",
            ),
        ),
    ]
