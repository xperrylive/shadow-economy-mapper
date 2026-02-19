"""
Supabase JWT Authentication for Django REST Framework.

Validates the JWT token from Supabase Auth and maps it to a Django user.
"""

import jwt
import os
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions


class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Authenticate requests using Supabase JWT tokens.

    Expects header: Authorization: Bearer <supabase-jwt>
    """

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split("Bearer ")[1]

        try:
            # Supabase JWTs are signed with the JWT secret from your project settings
            payload = jwt.decode(
                token,
                os.getenv("SUPABASE_JWT_SECRET", ""),
                algorithms=["HS256"],
                audience="authenticated",
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token.")

        # Get or create Django user from Supabase user ID
        supabase_user_id = payload.get("sub")
        email = payload.get("email", "")

        if not supabase_user_id:
            raise exceptions.AuthenticationFailed("Token missing user ID.")

        user, _ = User.objects.get_or_create(
            username=supabase_user_id,
            defaults={"email": email},
        )

        return (user, payload)
