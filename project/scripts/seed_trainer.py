import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'django-backend')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
django.setup()
from courses.models import Profile
from rest_framework.authtoken.models import Token

email = 'trainer_user@example.com'
user = Profile.objects.filter(email=email).first()
if not user:
    user = Profile.objects.create(
        username='trainer_user',
        email=email,
        first_name='Trainer',
        last_name='User',
        primary_role='trainer'
    )
    user.set_password('password')
    user.save()
    print('Created trainer user:', email)
else:
    print('Trainer user exists:', email)

token, created = Token.objects.get_or_create(user=user)
print('Token:', token.key)
