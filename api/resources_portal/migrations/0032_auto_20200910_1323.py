# Generated by Django 2.2.13 on 2020-09-10 13:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0031_auto_20200908_2023"),
    ]

    operations = [
        migrations.AddField(
            model_name="user", name="weekly_last_sent", field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name="notification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    (
                        "MATERIAL_REQUEST_SHARER_ASSIGNED_NEW",
                        "MATERIAL_REQUEST_SHARER_ASSIGNED_NEW",
                    ),
                    ("MATERIAL_REQUEST_SHARER_RECEIVED", "MATERIAL_REQUEST_SHARER_RECEIVED"),
                    ("MATERIAL_REQUEST_SHARER_ASSIGNED", "MATERIAL_REQUEST_SHARER_ASSIGNED"),
                    ("MATERIAL_REQUEST_SHARER_ASSIGNMENT", "MATERIAL_REQUEST_SHARER_ASSIGNMENT"),
                    ("MATERIAL_REQUEST_SHARER_APPROVED", "MATERIAL_REQUEST_SHARER_APPROVED"),
                    ("MATERIAL_REQUEST_SHARER_REJECTED", "MATERIAL_REQUEST_SHARER_REJECTED"),
                    ("MATERIAL_REQUEST_SHARER_CANCELLED", "MATERIAL_REQUEST_SHARER_CANCELLED"),
                    (
                        "MATERIAL_REQUEST_SHARER_RECEIVED_INFO",
                        "MATERIAL_REQUEST_SHARER_RECEIVED_INFO",
                    ),
                    (
                        "MATERIAL_REQUEST_SHARER_RECEIVED_MTA",
                        "MATERIAL_REQUEST_SHARER_RECEIVED_MTA",
                    ),
                    (
                        "MATERIAL_REQUEST_SHARER_EXECUTED_MTA",
                        "MATERIAL_REQUEST_SHARER_EXECUTED_MTA",
                    ),
                    (
                        "MATERIAL_REQUEST_SHARER_IN_FULFILLMENT",
                        "MATERIAL_REQUEST_SHARER_IN_FULFILLMENT",
                    ),
                    ("MATERIAL_REQUEST_SHARER_FULFILLED", "MATERIAL_REQUEST_SHARER_FULFILLED"),
                    ("MATERIAL_REQUEST_SHARER_VERIFIED", "MATERIAL_REQUEST_SHARER_VERIFIED"),
                    (
                        "MATERIAL_REQUEST_ISSUE_SHARER_REPORTED",
                        "MATERIAL_REQUEST_ISSUE_SHARER_REPORTED",
                    ),
                    ("MATERIAL_REQUEST_REQUESTER_ACCEPTED", "MATERIAL_REQUEST_REQUESTER_ACCEPTED"),
                    (
                        "MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT",
                        "MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT",
                    ),
                    (
                        "MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA",
                        "MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA",
                    ),
                    (
                        "MATERIAL_REQUEST_REQUESTER_FULFILLED",
                        "MATERIAL_REQUEST_REQUESTER_FULFILLED",
                    ),
                    ("MATERIAL_REQUEST_REQUESTER_REJECTED", "MATERIAL_REQUEST_REQUESTER_REJECTED"),
                    (
                        "MATERIAL_REQUEST_REQUESTER_CANCELLED",
                        "MATERIAL_REQUEST_REQUESTER_CANCELLED",
                    ),
                    (
                        "MATERIAL_REQUEST_REQUESTER_ESCALATED",
                        "MATERIAL_REQUEST_REQUESTER_ESCALATED",
                    ),
                    ("MATERIAL_ADDED", "MATERIAL_ADDED"),
                    ("MATERIAL_ARCHIVED", "MATERIAL_ARCHIVED"),
                    ("MATERIAL_DELETED", "MATERIAL_DELETED"),
                    ("ORGANIZATION_NEW_MEMBER", "ORGANIZATION_NEW_MEMBER"),
                    ("ORGANIZATION_BECAME_OWNER", "ORGANIZATION_BECAME_OWNER"),
                    ("ORGANIZATION_NEW_OWNER", "ORGANIZATION_NEW_OWNER"),
                    ("ORGANIZATION_MEMBER_LEFT", "ORGANIZATION_MEMBER_LEFT"),
                    ("ORGANIZATION_NEW_GRANT", "ORGANIZATION_NEW_GRANT"),
                    ("ORGANIZATION_INVITE", "ORGANIZATION_INVITE"),
                    ("REPORT_TO_GRANTS_TEAM", "REPORT_TO_GRANTS_TEAM"),
                ],
                max_length=64,
            ),
        ),
    ]
