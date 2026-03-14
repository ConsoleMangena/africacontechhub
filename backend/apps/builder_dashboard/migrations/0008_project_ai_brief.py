from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('builder_dashboard', '0007_alter_boqitem_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='ai_brief',
            field=models.TextField(blank=True, null=True, help_text='User-provided project summary/brief'),
        ),
    ]
