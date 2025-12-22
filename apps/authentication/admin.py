from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'first_name', 'last_name', 'phone_number')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email', 'first_name', 'last_name')
