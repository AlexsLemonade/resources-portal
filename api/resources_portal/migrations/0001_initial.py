# Generated by Django 2.2.12 on 2020-06-04 20:25

import uuid

import django.contrib.auth.models
import django.contrib.auth.validators
import django.contrib.postgres.fields
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
                ("published_name", models.TextField()),
            ],
            options={"verbose_name": "user", "verbose_name_plural": "users", "abstract": False,},
            managers=[("objects", django.contrib.auth.models.UserManager()),],
        ),
        migrations.CreateModel(
            name="Attachment",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("filename", models.TextField(help_text="The name of the attachment.", null=True)),
                (
                    "description",
                    models.TextField(
                        blank=True, help_text="A description for the attachment.", null=True
                    ),
                ),
                ("s3_bucket", models.CharField(blank=True, max_length=255, null=True)),
                ("s3_key", models.CharField(blank=True, max_length=255, null=True)),
                ("deleted", models.BooleanField(default=False)),
            ],
            options={"db_table": "attachments", "get_latest_by": "updated_at",},
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
            ],
            options={"db_table": "grants", "get_latest_by": "created_at",},
        ),
        migrations.CreateModel(
            name="GrantMaterialAssociation",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "grant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="resources_portal.Grant"
                    ),
                ),
            ],
            options={"db_table": "grant_material_associations",},
        ),
        migrations.CreateModel(
            name="GrantOrganizationAssociation",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "grant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="resources_portal.Grant"
                    ),
                ),
            ],
            options={"db_table": "grant_organization_associations",},
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
                ("title", models.TextField(help_text="The title of the material.")),
                ("needs_irb", models.BooleanField(default=False, null=True)),
                ("needs_abstract", models.BooleanField(default=False, null=True)),
                ("imported", models.BooleanField(default=False)),
                (
                    "import_source",
                    models.CharField(
                        choices=[
                            ("GEO", "GEO"),
                            ("SRA", "SRA"),
                            ("DBGAP", "DBGAP"),
                            ("DATASET", "DATASET"),
                            ("PROTOCOLS_IO", "PROTOCOLS_IO"),
                            ("ADDGENE", "ADDGENE"),
                            ("JACKSON_LAB", "JACKSON_LAB"),
                            ("ATCC", "ATCC"),
                            ("ZIRC", "ZIRC"),
                            ("OTHER", "OTHER"),
                        ],
                        max_length=32,
                        null=True,
                    ),
                ),
                (
                    "organism",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.TextField(), blank=True, null=True, size=None
                    ),
                ),
                ("publication_title", models.TextField(blank=True, null=True)),
                ("pre_print_doi", models.TextField(blank=True, null=True)),
                ("pre_print_title", models.TextField(blank=True, null=True)),
                ("citation", models.TextField(blank=True, null=True)),
                ("additional_info", models.TextField(blank=True, null=True)),
                ("embargo_date", models.DateField(blank=True, null=True)),
                (
                    "contact_user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    "grants",
                    models.ManyToManyField(
                        through="resources_portal.GrantMaterialAssociation",
                        to="resources_portal.Grant",
                    ),
                ),
                (
                    "mta_attachment",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="mta_materials",
                        to="resources_portal.Attachment",
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
                (
                    "grants",
                    models.ManyToManyField(
                        through="resources_portal.GrantOrganizationAssociation",
                        to="resources_portal.Grant",
                    ),
                ),
            ],
            options={
                "db_table": "organizations",
                "permissions": (
                    ("delete_resources", "delete_resources"),
                    ("add_members", "add_members"),
                    ("manage_permissions", "manage_permissions"),
                    ("add_owner", "add_owner"),
                    ("remove_members", "remove_members"),
                    ("add_resources", "add_resources"),
                    ("edit_resources", "edit_resources"),
                    ("archive_resources", "archive_resources"),
                    ("view_requests", "view_requests"),
                    ("approve_requests", "approve_requests"),
                ),
                "get_latest_by": "updated_at",
            },
        ),
        migrations.CreateModel(
            name="ShippingRequirements",
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
                ("needs_payment", models.BooleanField(default=False)),
                ("accepts_shipping_code", models.BooleanField(default=False)),
                ("accepts_reimbursement", models.BooleanField(default=False)),
                ("accepts_other_payment_methods", models.BooleanField(default=False)),
                ("restrictions", models.TextField(blank=True, null=True)),
                ("is_deleted", models.BooleanField(default=False)),
            ],
            options={"db_table": "shipping_requirements", "get_latest_by": "updated_at",},
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
        migrations.CreateModel(
            name="OrganizationInvitation",
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
                    "status",
                    models.CharField(
                        choices=[
                            ("PENDING", "PENDING"),
                            ("ACCEPTED", "ACCEPTED"),
                            ("REJECTED", "REJECTED"),
                            ("INVALID", "INVALID"),
                        ],
                        default="PENDING",
                        max_length=32,
                    ),
                ),
                (
                    "invite_or_request",
                    models.CharField(
                        choices=[("INVITE", "INVITE"), ("REQUEST", "REQUEST")],
                        default="INVITE",
                        max_length=32,
                    ),
                ),
                (
                    "organization",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="resources_portal.Organization",
                    ),
                ),
                (
                    "request_reciever",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    "requester",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="invitations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "organization_invitations", "get_latest_by": "updated_at",},
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
            name="Notification",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "notification_type",
                    models.CharField(
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
                        ],
                        max_length=32,
                    ),
                ),
                ("email", models.EmailField(max_length=254, null=True)),
                ("message", models.TextField(editable=False)),
                (
                    "associated_material",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="resources_portal.Material",
                    ),
                ),
                (
                    "associated_organization",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="resources_portal.Organization",
                    ),
                ),
                (
                    "associated_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="associated_notifications",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "notified_user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notifications",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "notifications", "get_latest_by": "created_at",},
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
                ("is_active", models.BooleanField(default=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("PENDING", "PENDING"),
                            ("APPROVED", "APPROVED"),
                            ("REJECTED", "REJECTED"),
                            ("INVALID", "INVALID"),
                            ("CANCELLED", "CANCELLED"),
                        ],
                        default="PENDING",
                        max_length=32,
                    ),
                ),
                (
                    "assigned_to",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="assignments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "executed_mta_attachment",
                    models.ForeignKey(
                        help_text="Attachment containing the MTA after it has been signed by all parties.",
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="requests_executed_mta",
                        to="resources_portal.Attachment",
                    ),
                ),
                (
                    "irb_attachment",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="requests_irb",
                        to="resources_portal.Attachment",
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
                (
                    "requester_signed_mta_attachment",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="requests_signed_mta",
                        to="resources_portal.Attachment",
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
        migrations.AddField(
            model_name="material",
            name="shipping_requirements",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="resources_portal.ShippingRequirements",
            ),
        ),
        migrations.CreateModel(
            name="GrantUserAssociation",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "grant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="resources_portal.Grant"
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
                "db_table": "grant_user_associations",
                "unique_together": {("grant", "user")},
            },
        ),
        migrations.AddField(
            model_name="grantorganizationassociation",
            name="organization",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="resources_portal.Organization"
            ),
        ),
        migrations.AddField(
            model_name="grantmaterialassociation",
            name="material",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="resources_portal.Material"
            ),
        ),
        migrations.AddField(
            model_name="grant",
            name="materials",
            field=models.ManyToManyField(
                through="resources_portal.GrantMaterialAssociation", to="resources_portal.Material"
            ),
        ),
        migrations.AddField(
            model_name="grant",
            name="organizations",
            field=models.ManyToManyField(
                through="resources_portal.GrantOrganizationAssociation",
                to="resources_portal.Organization",
            ),
        ),
        migrations.AddField(
            model_name="grant",
            name="users",
            field=models.ManyToManyField(
                through="resources_portal.GrantUserAssociation", to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name="attachment",
            name="sequence_map_for",
            field=models.ForeignKey(
                help_text="The cell line this seq_map is for. Only valid for seq_map attachments.",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="sequence_maps",
                to="resources_portal.Material",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="grants",
            field=models.ManyToManyField(
                through="resources_portal.GrantUserAssociation", to="resources_portal.Grant"
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="groups",
            field=models.ManyToManyField(
                blank=True,
                help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                related_name="user_set",
                related_query_name="user",
                to="auth.Group",
                verbose_name="groups",
            ),
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
        migrations.AlterUniqueTogether(
            name="grantorganizationassociation", unique_together={("grant", "organization")},
        ),
        migrations.AlterUniqueTogether(
            name="grantmaterialassociation", unique_together={("grant", "material")},
        ),
    ]
