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
    
    ENGAGEMENT_TIER_CHOICES = [
        ('DIY', 'Do It Yourself'),
        ('DIT', 'Do It Together'),
        ('DIFY', 'Do It For You'),
    ]
    engagement_tier = models.CharField(max_length=10, choices=ENGAGEMENT_TIER_CHOICES, default='DIY')

    def __str__(self):
        return self.title

class Milestone(TimeStampedModel):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
        ('PAID', 'Paid'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    due_date = models.DateField()

    def __str__(self):
        return f"{self.project.title} - {self.name}"

class SiteUpdate(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='site_updates')
    description = models.TextField()
    image = models.ImageField(upload_to='site_updates/')
    geo_location = models.CharField(max_length=255, blank=True, null=True, help_text="Geo-tagged location")
    verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Update for {self.project.title} on {self.created_at.strftime('%Y-%m-%d')}"

class ChangeOrder(TimeStampedModel):
    STATUS_CHOICES = [
        ('PROPOSED', 'Proposed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='change_orders')
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROPOSED')

    def __str__(self):
        return f"Change Order: {self.description[:50]}"
