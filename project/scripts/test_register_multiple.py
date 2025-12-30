"""Test register endpoint with multiple emails"""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()
client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'
for email in ['trainer_user@example.com', 'trainer_user1@example.com', 'trainer_user1@example.com']:
    resp = client.post('/api/auth/register/', {'email': email, 'password': 'password', 'full_name': 'X', 'role': 'trainer'}, format='json')
    print(email, resp.status_code, resp.content)
