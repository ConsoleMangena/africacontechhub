# Generated manually for preliminary vs final budgets

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def forwards_populate_budget_versions(apps, schema_editor):
    Project = apps.get_model("builder_dashboard", "Project")
    ProjectBudgetVersion = apps.get_model("builder_dashboard", "ProjectBudgetVersion")
    models_boq = [
        apps.get_model("builder_dashboard", "BOQBuildingItem"),
        apps.get_model("builder_dashboard", "BOQProfessionalFee"),
        apps.get_model("builder_dashboard", "BOQAdminExpense"),
        apps.get_model("builder_dashboard", "BOQLabourCost"),
        apps.get_model("builder_dashboard", "BOQMachinePlant"),
        apps.get_model("builder_dashboard", "BOQLabourBreakdown"),
        apps.get_model("builder_dashboard", "BOQScheduleTask"),
        apps.get_model("builder_dashboard", "ScheduleOfMaterial"),
    ]
    for project in Project.objects.all():
        pre, _ = ProjectBudgetVersion.objects.get_or_create(
            project=project,
            kind="PRELIMINARY",
            defaults={},
        )
        for M in models_boq:
            M.objects.filter(project_id=project.pk).update(budget_version=pre)


def backwards_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("builder_dashboard", "0018_boqbuildingitem_specification_scheduleofmaterial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectBudgetVersion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "kind",
                    models.CharField(
                        choices=[("PRELIMINARY", "Preliminary"), ("FINAL", "Final")],
                        max_length=20,
                    ),
                ),
                ("signed_at", models.DateTimeField(blank=True, null=True)),
                (
                    "author_signature",
                    models.CharField(
                        blank=True,
                        help_text="Author's typed name / signature line on the final budget",
                        max_length=255,
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="budget_versions",
                        to="builder_dashboard.project",
                    ),
                ),
                (
                    "signed_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="signed_budget_versions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["project_id", "kind"],
            },
        ),
        migrations.AddConstraint(
            model_name="projectbudgetversion",
            constraint=models.UniqueConstraint(
                fields=("project", "kind"),
                name="uniq_builder_project_budgetversion_kind",
            ),
        ),
        migrations.AddField(
            model_name="boqbuildingitem",
            name="budget_version",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="building_items",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AddField(
            model_name="boqprofessionalfee",
            name="budget_version",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="professional_fees",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AddField(
            model_name="boqadminexpense",
            name="budget_version",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="admin_expenses",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AddField(
            model_name="boqlabourcost",
            name="budget_version",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="labour_costs",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AddField(
            model_name="boqmachineplant",
            name="budget_version",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="machine_plants",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AddField(
            model_name="boqlabourbreakdown",
            name="budget_version",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="labour_breakdowns",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AddField(
            model_name="boqscheduletask",
            name="budget_version",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="schedule_tasks",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AddField(
            model_name="scheduleofmaterial",
            name="budget_version",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="schedule_materials",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.RunPython(forwards_populate_budget_versions, backwards_noop),
        migrations.RemoveField(model_name="boqbuildingitem", name="project"),
        migrations.RemoveField(model_name="boqprofessionalfee", name="project"),
        migrations.RemoveField(model_name="boqadminexpense", name="project"),
        migrations.RemoveField(model_name="boqlabourcost", name="project"),
        migrations.RemoveField(model_name="boqmachineplant", name="project"),
        migrations.RemoveField(model_name="boqlabourbreakdown", name="project"),
        migrations.RemoveField(model_name="boqscheduletask", name="project"),
        migrations.RemoveField(model_name="scheduleofmaterial", name="project"),
        migrations.AlterField(
            model_name="boqbuildingitem",
            name="budget_version",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="building_items",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AlterField(
            model_name="boqprofessionalfee",
            name="budget_version",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="professional_fees",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AlterField(
            model_name="boqadminexpense",
            name="budget_version",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="admin_expenses",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AlterField(
            model_name="boqlabourcost",
            name="budget_version",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="labour_costs",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AlterField(
            model_name="boqmachineplant",
            name="budget_version",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="machine_plants",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AlterField(
            model_name="boqlabourbreakdown",
            name="budget_version",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="labour_breakdowns",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AlterField(
            model_name="boqscheduletask",
            name="budget_version",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="schedule_tasks",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
        migrations.AlterField(
            model_name="scheduleofmaterial",
            name="budget_version",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="schedule_materials",
                to="builder_dashboard.projectbudgetversion",
            ),
        ),
    ]
