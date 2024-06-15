import os
import firebase_admin
from firebase_admin import auth
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import authentication, exceptions


class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            raise exceptions.AuthenticationFailed('No auth token provided')

        id_token = auth_header.split(' ').pop()
        try:
            decoded_token = auth.verify_id_token(id_token)
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid auth token')

        if not decoded_token:
            return None

        uid = decoded_token.get('uid')
        user, created = User.objects.get_or_create(username=uid)
        user.last_login = timezone.now()
        user.save()

        return (user, None)
