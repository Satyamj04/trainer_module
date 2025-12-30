"""Test register endpoint via Django test client."""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()

client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'
# Use a unique email to avoid collision
email = 'new_trainer@example.com'
resp = client.post('/api/auth/register/', {'email': email, 'password': 'password', 'full_name': 'New Trainer', 'role': 'trainer'}, format='json')
print('Status:', resp.status_code)
print('Response:', resp.json())
# If created, try to use login endpoint
if resp.status_code == 200:
    token = resp.json().get('token')
    if token:
        client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        resp2 = client.get('/api/profiles/me/')
        print('Me Status:', resp2.status_code)
        print('Me:', resp2.json())
