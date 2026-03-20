import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.builder_dashboard.models import Project, BOQBuildingItem, BOQLabourCost, BOQProfessionalFee

def dedupe(qs, attr_keys):
    seen = set()
    to_delete = []
    for item in qs:
        key = tuple(getattr(item, k) for k in attr_keys)
        if key in seen:
            to_delete.append(item.id)
        else:
            seen.add(key)
    
    if to_delete:
        qs.model.objects.filter(id__in=to_delete).delete()
        print(f"Deleted {len(to_delete)} duplicate {qs.model.__name__} items")

for p in Project.objects.all():
    print(f"Checking Project: {p.title}")
    dedupe(p.building_items.all(), ['bill_no', 'description'])
    dedupe(p.professional_fees.all(), ['discipline', 'role_scope'])
    dedupe(p.admin_expenses.all(), ['item_role', 'description'])
    dedupe(p.labour_costs.all(), ['phase', 'trade_role'])
    dedupe(p.machine_plants.all(), ['category', 'machine_item'])
    dedupe(p.labour_breakdowns.all(), ['phase', 'trade_role'])
    dedupe(p.schedule_tasks.all(), ['wbs', 'task_description'])
    dedupe(p.schedule_materials.all(), ['section', 'material_description'])

