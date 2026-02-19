"""Organization models: NGO/Bank dashboard (stretch goal)."""

import uuid
from django.db import models
from django.contrib.auth.models import User


class Organization(models.Model):
    """An organization (NGO, bank, gov) that reviews reports."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    org_type = models.CharField(max_length=50)  # ngo, bank, government
    members = models.ManyToManyField(User, through="OrganizationMember")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "organizations"

    def __str__(self):
        return self.name


class OrganizationMember(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin"
        REVIEWER = "reviewer"
        VIEWER = "viewer"

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.VIEWER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "organization_members"
        unique_together = ["user", "organization"]
