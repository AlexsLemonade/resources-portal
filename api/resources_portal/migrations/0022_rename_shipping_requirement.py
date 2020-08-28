from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("resources_portal", "0021_auto_20200825_1511"),
    ]

    operations = [
        migrations.RenameModel("ShippingRequirements", "ShippingRequirement"),
    ]
