"""
Supabase JWT Authentication for Django REST Framework.

Validates the JWT token from Supabase Auth and maps it to a Django user.
"""

import os
import json
import urllib.request
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions


class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Authenticate requests using Supabase JWT tokens via network call.

    Expects header: Authorization: Bearer <supabase-jwt>
    """

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split("Bearer ")[1]

        supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        anon_key = os.getenv("SUPABASE_ANON_KEY", "")

        if not supabase_url or not anon_key:
            raise exceptions.AuthenticationFailed("Server missing Supabase credentials.")

        try:
            req = urllib.request.Request(
                f"{supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": anon_key,
                },
            )
            with urllib.request.urlopen(req) as response:
                if response.status != 200:
                    raise exceptions.AuthenticationFailed("Invalid or expired token.")
                user_data = json.loads(response.read().decode())
        except Exception as e:
            print(f"Supabase network auth error: {e}")
            raise exceptions.AuthenticationFailed("Token validation failed.")

        supabase_user_id = user_data.get("id")
        email = user_data.get("email", "")

        if not supabase_user_id:
            raise exceptions.AuthenticationFailed("Token missing user ID.")

        user, _ = User.objects.get_or_create(
            username=supabase_user_id,
            defaults={"email": email},
        )

        return (user, user_data)
