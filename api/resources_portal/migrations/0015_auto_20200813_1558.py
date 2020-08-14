# Generated by Django 2.2.13 on 2020-08-13 15:58

import django.contrib.auth.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0014_auto_20200812_2144"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="full_name",
            field=models.TextField(default="", editable=False),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="user",
            name="username",
            field=models.CharField(
                editable=False,
                error_messages={"unique": "A user with that username already exists."},
                max_length=150,
                unique=True,
                validators=[django.contrib.auth.validators.UnicodeUsernameValidator()],
                verbose_name="username",
            ),
        ),
    ]
