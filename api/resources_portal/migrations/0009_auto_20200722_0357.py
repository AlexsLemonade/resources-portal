# Generated by Django 2.2.13 on 2020-07-22 03:57

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0008_auto_20200701_2137"),
    ]

    operations = [
        migrations.AddField(
            model_name="attachment",
            name="owned_by_org",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="attachments",
                to="resources_portal.Organization",
            ),
        ),
        migrations.AddField(
            model_name="attachment",
            name="owned_by_user",
            field=models.ForeignKey(
                default="",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="owned_attachments",
                to=settings.AUTH_USER_MODEL,
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="attachment",
            name="attachment_type",
            field=models.CharField(
                choices=[
                    ("MTA", "MTA"),
                    ("SIGNED_MTA", "SIGNED_MTA"),
                    ("EXECUTED_MTA", "EXECUTED_MTA"),
                    ("IRB", "IRB"),
                    ("SIGNED_IRB", "SIGNED_IRB"),
                    ("EXECUTED_IRB", "EXECUTED_IRB"),
                    ("SEQUENCE_MAP", "SEQUENCE_MAP"),
                ],
                max_length=32,
            ),
        ),
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
                    ("FULFILLED", "FULFILLED"),
                ],
                default="PENDING",
                max_length=32,
            ),
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
                    ("SIGNED_MTA_UPLOADED", "SIGNED_MTA_UPLOADED"),
                    ("EXECUTED_MTA_UPLOADED", "EXECUTED_MTA_UPLOADED"),
                    ("APPROVE_REQUESTS_PERM_GRANTED", "APPROVE_REQUESTS_PERM_GRANTED"),
                    ("TRANSFER_REQUESTED", "TRANSFER_REQUESTED"),
                    ("TRANSFER_APPROVED", "TRANSFER_APPROVED"),
                    ("TRANSFER_REJECTED", "TRANSFER_REJECTED"),
                    ("TRANSFER_FULFILLED", "TRANSFER_FULFILLED"),
                    ("REMOVED_FROM_ORG", "REMOVED_FROM_ORG"),
                ],
                max_length=32,
            ),
        ),
    ]