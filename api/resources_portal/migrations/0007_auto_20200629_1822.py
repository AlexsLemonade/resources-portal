# Generated by Django 2.2.13 on 2020-06-29 18:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0006_auto_20200625_1726"),
    ]

    operations = [
        migrations.AddField(
            model_name="organizationusersetting",
            name="misc_notif",
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name="notification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("ORG_REQUEST_CREATED", "ORG_REQUEST_CREATED"),
                    ("ORG_INVITE_CREATED", "ORG_INVITE_CREATED"),
                    ("ORG_INVITE_ACCEPTED", "ORG_INVITE_ACCEPTED"),
                    ("ORG_REQUEST_ACCEPTED", "ORG_REQUEST_ACCEPTED"),
                    ("ORG_INVITE_REJECTED", "ORG_INVITE_REJECTED"),
                    ("ORG_REQUEST_REJECTED", "ORG_REQUEST_REJECTED"),
                    ("ORG_INVITE_INVALID", "ORG_INVITE_INVALID"),
                    ("ORG_REQUEST_INVALID", "ORG_REQUEST_INVALID"),
                    ("MTA_UPLOADED", "MTA_UPLOADED"),
                    ("APPROVE_REQUESTS_PERM_GRANTED", "APPROVE_REQUESTS_PERM_GRANTED"),
                    ("TRANSFER_REQUESTED", "TRANSFER_REQUESTED"),
                    ("TRANSFER_APPROVED", "TRANSFER_APPROVED"),
                    ("TRANSFER_REJECTED", "TRANSFER_REJECTED"),
                    ("REMOVED_FROM_ORG", "REMOVED_FROM_ORG"),
                ],
                max_length=32,
            ),
        ),
    ]
