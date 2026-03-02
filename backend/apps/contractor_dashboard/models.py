from django.db import models
from django.conf import settings
from apps.builder_dashboard.models import Project
from apps.core.models import TimeStampedModel

class ContractorProfile(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contractor_profile')
    company_name = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100)

    def __str__(self):
        return self.company_name

class Bid(TimeStampedModel):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='bids')
    contractor = models.ForeignKey(ContractorProfile, on_delete=models.CASCADE, related_name='bids')
    direct_costs = models.DecimalField(max_digits=12, decimal_places=2)
    overhead = models.DecimalField(max_digits=12, decimal_places=2)
    net_margin = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    def save(self, *args, **kwargs):
        # Automatically calculate total amount
        self.total_amount = self.direct_costs + self.overhead + self.net_margin
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Bid for {self.project.title} by {self.contractor.company_name}"

class WIPAA(TimeStampedModel):
    """
    Work In Progress Account Analysis (WIPAA) - Solvency Monitor
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='wipaa_records')
    contractor = models.ForeignKey(ContractorProfile, on_delete=models.CASCADE, related_name='wipaa_records')
    period = models.DateField(help_text="End date of the reporting period")
    costs_incurred = models.DecimalField(max_digits=12, decimal_places=2)
    billed_revenue = models.DecimalField(max_digits=12, decimal_places=2)
    earned_revenue = models.DecimalField(max_digits=12, decimal_places=2)

    @property
    def over_under_billing(self):
        return self.billed_revenue - self.earned_revenue

    def __str__(self):
        return f"WIPAA for {self.project.title} - {self.period}"

class ContractorRating(TimeStampedModel):
    """
    Ratings given by clients (builders) to contractors after project completion
    """
    contractor = models.ForeignKey(ContractorProfile, on_delete=models.CASCADE, related_name='ratings')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='contractor_ratings')
    builder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_ratings')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], help_text="Rating from 1 to 5")
    comment = models.TextField(blank=True, null=True, help_text="Optional comment about the contractor")

    class Meta:
        unique_together = ['contractor', 'project', 'builder']  # One rating per builder per project
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}/5 rating for {self.contractor.company_name} on {self.project.title}"
