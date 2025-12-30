"""Debug login endpoint"""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()
client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'

email = 'trainer456@gmail.com'
password = 'trainer@123'

# Try login with username=email
resp = client.post('/api/auth/login/', {'username': email, 'password': password}, format='json')
print('Login attempt:')
print('Status:', resp.status_code)
print('Response:', resp.json() if resp.status_code < 500 else resp.content)

# Also check if user exists in DB
from courses.models import Profile
user = Profile.objects.filter(email=email).first()
if user:
    print('\nUser found in DB:')
    print('Email:', user.email)
    print('Username:', user.username)
    print('Password hash (first 50 chars):', user.password[:50])
    # Test password check
    print('Password check (check_password):', user.check_password(password))
else:
    print('\nUser NOT found in DB')
