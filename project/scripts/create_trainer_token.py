"""Create an auth token for a trainer user by email.
Usage: run inside the project venv: python scripts/create_trainer_token.py trainer@example.com
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
django.setup()

from courses.models import Profile
from rest_framework.authtoken.models import Token


def create_token_for_email(email):
    try:
        user = Profile.objects.get(email=email)
    except Profile.DoesNotExist:
        print(f"User with email {email} does not exist")
        return
    token, created = Token.objects.get_or_create(user=user)
    if created:
        print(f"Created token: {token.key}")
    else:
        print(f"Token exists: {token.key}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Provide an email as the argument")
        sys.exit(1)
    create_token_for_email(sys.argv[1])
