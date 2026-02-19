from django.urls import path
from .views import org_placeholder

urlpatterns = [
    path("", org_placeholder, name="org-placeholder"),
]
