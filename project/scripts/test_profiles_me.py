"""Test /api/profiles/me/ endpoint"""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
django.setup()

from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from courses.models import Profile

client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'

email = 'trainer456@gmail.com'
user = Profile.objects.get(email=email)
token = Token.objects.get(user=user)

print('Testing /api/profiles/me/ with token:', token.key)
client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
resp = client.get('/api/profiles/me/')
print('Status:', resp.status_code)
print('Response:', resp.json() if resp.status_code < 500 else resp.content)
