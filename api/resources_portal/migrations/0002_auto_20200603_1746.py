# Generated by Django 2.2.12 on 2020-06-03 17:46

from django.db import migrations, models

import resources_portal.models.user


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelManagers(
            name="user",
            managers=[("objects", resources_portal.models.user.NonDeletedObjectsManager()),],
        ),
        migrations.AddField(
            model_name="grant",
            name="deleted",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name="material",
            name="deleted",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name="materialrequest",
            name="deleted",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name="materialshareevent",
            name="deleted",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name="notification",
            name="deleted",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name="organization",
            name="deleted",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name="organizationinvitation",
            name="deleted",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name="organizationusersetting",
            name="deleted",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name="shippingrequirements",
            name="deleted",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AddField(
            model_name="user", name="deleted", field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="grants",
            field=models.ManyToManyField(
                through="resources_portal.GrantUserAssociation", to="resources_portal.Grant"
            ),
        ),
    ]
