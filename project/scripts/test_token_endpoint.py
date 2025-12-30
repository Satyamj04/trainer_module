"""Test token_by_email endpoint via Django test client."""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()
from courses.models import Profile

client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'
resp = client.post('/api/auth/token_by_email/', {'email': 'trainer_user@example.com'}, format='json')
print('Status:', resp.status_code)
print('Response:', resp.json())
