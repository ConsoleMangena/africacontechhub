from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel

class Project(TimeStampedModel):
    STATUS_CHOICES = [
        ('PLANNING', 'Planning'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('ON_HOLD', 'On Hold'),
    ]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_projects')
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Project latitude")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text="Project longitude")
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')
    si56_verified = models.BooleanField(default=False, help_text="Verified against SI 56 of 2025 (Registered Architects)")
    is_budget_signed = models.BooleanField(default=False, help_text="Indicates if the construction budget has been signed by the builder")
    
    ENGAGEMENT_TIER_CHOICES = [
        ('DIT', 'Do It Together'),
        ('DIFY', 'Do It For You'),
    ]
    engagement_tier = models.CharField(max_length=10, choices=ENGAGEMENT_TIER_CHOICES, default='DIT')
    ai_brief = models.TextField(blank=True, null=True, help_text="User-provided project summary/brief")
    
    architect = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_projects',
        help_text="Primary architect assigned to this project"
    )

    # Detailed program/brief fields
    building_type = models.CharField(max_length=50, blank=True, null=True)
    use_case = models.CharField(max_length=50, blank=True, null=True)
    occupants = models.PositiveIntegerField(blank=True, null=True)
    bedrooms = models.PositiveIntegerField(blank=True, null=True)
    bathrooms = models.PositiveIntegerField(blank=True, null=True)
    floors = models.PositiveIntegerField(blank=True, null=True)
    has_garage = models.BooleanField(blank=True, null=True)
    parking_spaces = models.PositiveIntegerField(blank=True, null=True)
    lot_size = models.CharField(max_length=100, blank=True, null=True, help_text="Lot size / site area")
    footprint = models.CharField(max_length=100, blank=True, null=True, help_text="Desired building footprint")
    preferred_style = models.CharField(max_length=50, blank=True, null=True)
    roof_type = models.CharField(max_length=50, blank=True, null=True)
    special_spaces = models.TextField(blank=True, null=True)
    sustainability = models.TextField(blank=True, null=True)
    accessibility = models.TextField(blank=True, null=True)
    site_notes = models.TextField(blank=True, null=True)
    constraints = models.TextField(blank=True, null=True)
    timeline = models.CharField(max_length=20, blank=True, null=True)
    budget_flex = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class SiteUpdate(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='site_updates')
    description = models.TextField()
    image = models.ImageField(upload_to='site_updates/')
    geo_location = models.CharField(max_length=255, blank=True, null=True, help_text="Geo-tagged location")
    verified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Update for {self.project.title} on {self.created_at.strftime('%Y-%m-%d')}"

class EscrowMilestone(TimeStampedModel):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('locked', 'Locked'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='escrow_milestones')
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='locked')
    released = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.name} - ${self.amount}"

class CapitalSchedule(TimeStampedModel):
    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('upcoming', 'Upcoming'),
        ('overdue', 'Overdue'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='capital_schedules')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return f"{self.description} - ${self.amount} ({self.status})"

class MaterialAudit(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='material_audits')
    material_name = models.CharField(max_length=255)
    delivered_qty = models.DecimalField(max_digits=12, decimal_places=2)
    installed_qty = models.DecimalField(max_digits=12, decimal_places=2)
    theoretical_usage = models.DecimalField(max_digits=12, decimal_places=2, help_text="Expected usage based on installed qty")
    actual_usage = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=50, default='units')
    audit_passed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.material_name} audit - {'PASSED' if self.audit_passed else 'FAILED'}"

class WeatherEvent(TimeStampedModel):
    VERDICT_CHOICES = [
        ('approved', 'Delay Approved'),
        ('rejected', 'Delay Rejected'),
        ('pending', 'Pending Review'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='weather_events')
    contractor_claim = models.TextField(help_text="Contractor's delay claim description")
    claimed_delay_days = models.PositiveIntegerField()
    actual_rainfall_mm = models.DecimalField(max_digits=8, decimal_places=2)
    verdict = models.CharField(max_length=20, choices=VERDICT_CHOICES, default='pending')
    date = models.DateField()

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Weather event {self.date} - {self.verdict}"

class ESignatureRequest(TimeStampedModel):
    DOCUMENT_TYPE_CHOICES = [
        ('payment_release', 'Payment Release'),
        ('variation_order', 'Variation Order'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('signed', 'Signed'),
        ('rejected', 'Rejected'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='esignature_requests')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPE_CHOICES)
    party_name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField()

    class Meta:
        ordering = ['-due_date']

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.party_name} (${self.amount})"

class SiteCamera(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='site_cameras')
    name = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    recording = models.BooleanField(default=False)
    stream_url = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({'Active' if self.active else 'Offline'})"


class BOQItem(TimeStampedModel):
    CATEGORY_CHOICES = [
        ('1. Preliminaries & General', '1. Preliminaries & General'),
        ('2. Earthworks & Excavation', '2. Earthworks & Excavation'),
        ('3. Concrete, Formwork & Reinforcement', '3. Concrete, Formwork & Reinforcement'),
        ('4. Brickwork & Blockwork', '4. Brickwork & Blockwork'),
        ('5. Waterproofing', '5. Waterproofing'),
        ('6. Carpentry, Joinery & Ironmongery', '6. Carpentry, Joinery & Ironmongery'),
        ('7. Roof Coverings', '7. Roof Coverings'),
        ('8. Plumbing & Drainage', '8. Plumbing & Drainage'),
        ('9. Electrical Installations', '9. Electrical Installations'),
        ('10. Floor, Wall & Ceiling Finishes', '10. Floor, Wall & Ceiling Finishes'),
        ('11. Glazing & Painting', '11. Glazing & Painting'),
        ('12. External Works', '12. External Works'),
        ('13. Provisional & Prime Cost Sums', '13. Provisional & Prime Cost Sums'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='boq_items')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    item_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    unit = models.CharField(max_length=30, help_text="e.g. m², m³, nr, kg, item")
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    rate = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, editable=False, default=0)
    labour_rate = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    measurement_formula = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        ordering = ['category', 'created_at']
        verbose_name = 'BOQ Item'
        verbose_name_plural = 'BOQ Items'

    def save(self, *args, **kwargs):
        self.total_amount = self.quantity * self.rate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.item_name} ({self.category}) - ${self.total_amount}"


class MaterialRequest(TimeStampedModel):
    METHOD_CHOICES = [
        ('SELF', 'Procure by Yourself'),
        ('GROUP_BUY', 'Group Buy Aggregator'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('ORDERED', 'Ordered'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='material_requests')
    boq_item = models.ForeignKey(BOQItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests')
    material_name = models.CharField(max_length=255)
    quantity_requested = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=30)
    procurement_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='SELF')
    price_at_request = models.DecimalField(max_digits=12, decimal_places=2)
    transport_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    group_buy_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_calculated_cost = models.DecimalField(max_digits=14, decimal_places=2, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.total_calculated_cost = (self.quantity_requested * self.price_at_request) + self.transport_cost - self.group_buy_deduction
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.material_name} ({self.get_procurement_method_display()}) - {self.status}"


class DrawingRequest(TimeStampedModel):
    DRAWING_TYPE_CHOICES = [
        ('floor_plan', 'Floor Plan'),
        ('elevation', 'Elevation'),
        ('section', 'Section View'),
        ('3d_render', '3D Render'),
        ('blueprint', 'Technical Blueprint'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('REJECTED', 'Rejected'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='drawing_requests')
    drawing_type = models.CharField(max_length=20, choices=DRAWING_TYPE_CHOICES, default='floor_plan')
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_drawing_type_display()}) - {self.status}"


class DrawingFile(TimeStampedModel):
    request = models.ForeignKey(DrawingRequest, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='drawing_files/')
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.CharField(max_length=50)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.original_name
class ProjectTeam(TimeStampedModel):
    ROLE_CHOICES = [
        ('architect', 'Architect'),
        ('structural_engineer', 'Structural Engineer'),
        ('contractor', 'General Contractor'),
        ('project_manager', 'Project Manager'),
        ('quantity_surveyor', 'Quantity Surveyor'),
        ('electrician', 'Electrician'),
        ('plumber', 'Plumber'),
        ('mason', 'Mason/Bricklayer'),
        ('carpenter', 'Carpenter'),
        ('painter', 'Painter'),
        ('roofer', 'Roofer'),
        ('tiler', 'Tiler'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='team_members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='team_assignments')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['role', 'created_at']
        unique_together = ['project', 'user', 'role']

    def __str__(self):
        return f"{self.user.username} as {self.role} for {self.project.title}"
