"""Test fresh registration"""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()
client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'
email = 'brand_new_trainer@example.com'
resp = client.post('/api/auth/register/', {'email': email, 'password': 'password', 'full_name': 'Brand New Trainer', 'role': 'trainer'}, format='json')
print('Register:', resp.status_code)
if resp.status_code == 200:
    data = resp.json()
    print('Token:', data.get('token'))
    print('User:', data.get('user'))
    # Now login
    resp2 = client.post('/api/auth/login/', {'username': email, 'password': 'password'}, format='json')
    print('Login:', resp2.status_code, resp2.json() if resp2.status_code < 500 else resp2.content)
else:
    print('Error:', resp.json())
