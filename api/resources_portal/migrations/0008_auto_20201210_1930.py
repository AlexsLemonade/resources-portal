# Generated by Django 2.2.13 on 2020-12-10 19:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0007_auto_20201203_2010"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user", name="first_name", field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="user", name="last_name", field=models.CharField(max_length=100),
        ),
    ]