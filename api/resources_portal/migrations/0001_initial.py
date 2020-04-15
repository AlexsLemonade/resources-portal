# Generated by Django 3.0.3 on 2020-04-14 21:38

import uuid

import django.contrib.auth.models
import django.contrib.auth.validators
import django.contrib.postgres.fields.jsonb
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0011_update_proxy_permissions"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(blank=True, null=True, verbose_name="last login"),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "username",
                    models.CharField(
                        error_messages={"unique": "A user with that username already exists."},
                        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
                        max_length=150,
                        unique=True,
                        validators=[django.contrib.auth.validators.UnicodeUsernameValidator()],
                        verbose_name="username",
                    ),
                ),
                (
                    "first_name",
                    models.CharField(blank=True, max_length=30, verbose_name="first name"),
                ),
                (
                    "last_name",
                    models.CharField(blank=True, max_length=150, verbose_name="last name"),
                ),
                (
                    "email",
                    models.EmailField(blank=True, max_length=254, verbose_name="email address"),
                ),
                (
                    "is_staff",
                    models.BooleanField(
                        default=False,
                        help_text="Designates whether the user can log into this admin site.",
                        verbose_name="staff status",
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
                        verbose_name="active",
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="date joined"
                    ),
                ),
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.Group",
                        verbose_name="groups",
                    ),
                ),
            ],
            options={"verbose_name": "user", "verbose_name_plural": "users", "abstract": False,},
            managers=[("objects", django.contrib.auth.models.UserManager()),],
        ),
        migrations.CreateModel(
            name="Material",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("CELL_LINE", "CELL_LINE"),
                            ("PLASMID", "PLASMID"),
                            ("PROTOCOL", "PROTOCOL"),
                            ("DATASET", "DATASET"),
                            ("MODEL_ORGANISM", "MODEL_ORGANISM"),
                            ("PDX", "PDX"),
                            ("OTHER", "OTHER"),
                        ],
                        max_length=32,
                    ),
                ),
                ("url", models.TextField(blank=True, null=True)),
                ("pubmed_id", models.CharField(blank=True, max_length=32)),
                (
                    "additional_metadata",
                    django.contrib.postgres.fields.jsonb.JSONField(default=dict),
                ),
                (
                    "mta_s3_url",
                    models.TextField(
                        blank=True, help_text="Contains an url to download the MTA.", null=True
                    ),
                ),
                ("title", models.TextField(help_text="The title of the material.")),
                ("needs_mta", models.BooleanField(default=False, null=True)),
                ("needs_irb", models.BooleanField(default=False, null=True)),
                ("needs_abstract", models.BooleanField(default=False, null=True)),
                ("imported", models.BooleanField(default=False)),
                (
                    "contact_user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
            options={"db_table": "materials", "get_latest_by": "created_at",},
        ),
        migrations.CreateModel(
            name="Organization",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.TextField(help_text="The name of the organization.")),
            ],
            options={
                "db_table": "organizations",
                "permissions": [("approve_requests", "Can approve requests")],
                "get_latest_by": "created_at",
            },
        ),
        migrations.CreateModel(
            name="OrganizationUserSetting",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("new_request_notif", models.BooleanField(default=True)),
                ("change_in_request_status_notif", models.BooleanField(default=True)),
                ("request_approval_determined_notif", models.BooleanField(default=True)),
                ("request_assigned_notif", models.BooleanField(default=True)),
                ("reminder_notif", models.BooleanField(default=True)),
                (
                    "organization",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_settings",
                        to="resources_portal.Organization",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="organization_settings",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "organization_user_setting", "get_latest_by": "created_at",},
        ),
        migrations.CreateModel(
            name="OrganizationUserAssociation",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "organization",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="resources_portal.Organization",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
            options={
                "db_table": "organization_user_associations",
                "unique_together": {("organization", "user")},
            },
        ),
        migrations.AddField(
            model_name="organization",
            name="members",
            field=models.ManyToManyField(
                through="resources_portal.OrganizationUserAssociation", to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name="organization",
            name="owner",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="owned_organizations",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.CreateModel(
            name="MaterialShareEvent",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("event_type", models.CharField(blank=True, max_length=255, null=True)),
                ("time", models.DateTimeField()),
                (
                    "assigned_to",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="material_share_assignments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="material_share_events",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "material",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="share_events",
                        to="resources_portal.Material",
                    ),
                ),
            ],
            options={"db_table": "material_share_events", "get_latest_by": "created_at",},
        ),
        migrations.CreateModel(
            name="MaterialRequest",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "requester_signed_mta_s3_url",
                    models.TextField(
                        help_text="Url to download the MTA after it was signed by the requester"
                    ),
                ),
                ("irb_s3_url", models.TextField(help_text="Url to download the IRB")),
                (
                    "executed_mta_s3_url",
                    models.TextField(
                        help_text="Url to download the MTA after it has been signed by all parties."
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("status", models.CharField(blank=True, max_length=255, null=True)),
                (
                    "assigned_to",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="assignments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "material",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="requests",
                        to="resources_portal.Material",
                    ),
                ),
                (
                    "requester",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="material_requests",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "material_requests", "get_latest_by": "created_at",},
        ),
        migrations.AddField(
            model_name="material",
            name="organization",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="materials",
                to="resources_portal.Organization",
            ),
        ),
        migrations.CreateModel(
            name="Grant",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.TextField()),
                ("funder_id", models.CharField(max_length=80)),
                (
                    "materials",
                    models.ManyToManyField(related_name="grants", to="resources_portal.Material"),
                ),
                (
                    "organizations",
                    models.ManyToManyField(
                        related_name="grants", to="resources_portal.Organization"
                    ),
                ),
                (
                    "users",
                    models.ManyToManyField(related_name="grants", to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={"db_table": "grants", "get_latest_by": "created_at",},
        ),
        migrations.AddField(
            model_name="user",
            name="organizations",
            field=models.ManyToManyField(
                through="resources_portal.OrganizationUserAssociation",
                to="resources_portal.Organization",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="user_permissions",
            field=models.ManyToManyField(
                blank=True,
                help_text="Specific permissions for this user.",
                related_name="user_set",
                related_query_name="user",
                to="auth.Permission",
                verbose_name="user permissions",
            ),
        ),
    ]
