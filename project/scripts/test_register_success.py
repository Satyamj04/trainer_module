"""Test successful register endpoint"""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()
client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'
email = 'ui_trainer@example.com'
resp = client.post('/api/auth/register/', {'email': email, 'password': 'password', 'full_name': 'UI Trainer', 'role': 'trainer'}, format='json')
print('Status:', resp.status_code)
print('Resp:', resp.json())
