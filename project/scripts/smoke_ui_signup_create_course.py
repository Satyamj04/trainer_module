"""Smoke test: register via /api/auth/register/, login via /api/auth/login/, create course via trainer endpoint"""
import os, sys, time
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()
client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'

email = f'smoke_{int(time.time())}@example.com'
password = 'password'
# Register
resp = client.post('/api/auth/register/', {'email': email, 'password': password, 'full_name': 'Flow Trainer', 'role': 'trainer'}, format='json')
print('Register:', resp.status_code, resp.content)
# Login
resp_login = client.post('/api/auth/login/', {'username': email, 'password': password}, format='json')
print('Login:', resp_login.status_code, resp_login.content)
if resp_login.status_code == 200:
    token = resp_login.json().get('token')
    client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
    # create course
    payload = {'title': 'Smoke Flow Course', 'description': 'created via smoke end-to-end'}
    resp_course = client.post('/api/trainer/v1/course/', data=payload, format='json')
    print('Create course:', resp_course.status_code, resp_course.json() if resp_course.status_code < 500 else resp_course.content)
else:
    print('Login failed')
