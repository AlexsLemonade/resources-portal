# Generated by Django 2.2.13 on 2020-09-17 15:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0033_user_weekly_digest_last_sent"),
    ]

    operations = [
        migrations.AddField(
            model_name="materialrequest",
            name="is_active",
            field=models.BooleanField(editable=False, null=True),
        ),
    ]
