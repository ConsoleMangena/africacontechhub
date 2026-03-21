# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("builder_dashboard", "0019_project_budget_version"),
    ]

    operations = [
        migrations.AddField(
            model_name="projectbudgetversion",
            name="signature_image",
            field=models.TextField(
                blank=True,
                help_text="Snapshot of profile digital signature (data URL) at sign time",
                null=True,
            ),
        ),
    ]
