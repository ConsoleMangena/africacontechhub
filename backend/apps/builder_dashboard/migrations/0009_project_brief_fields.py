from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('builder_dashboard', '0008_project_ai_brief'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='accessibility',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='bathrooms',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='bedrooms',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='budget_flex',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='building_type',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='constraints',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='floors',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='footprint',
            field=models.CharField(blank=True, max_length=100, null=True, help_text='Desired building footprint'),
        ),
        migrations.AddField(
            model_name='project',
            name='has_garage',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='lot_size',
            field=models.CharField(blank=True, max_length=100, null=True, help_text='Lot size / site area'),
        ),
        migrations.AddField(
            model_name='project',
            name='occupants',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='parking_spaces',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='preferred_style',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='roof_type',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='site_notes',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='special_spaces',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='sustainability',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='timeline',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='use_case',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
