"""Add trainer_new user to the database"""
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
full_name = 'trainer_new'

resp = client.post('/api/auth/register/', {
    'email': email, 
    'password': password, 
    'full_name': full_name, 
    'role': 'trainer'
}, format='json')

print('Status:', resp.status_code)
if resp.status_code == 200:
    data = resp.json()
    print('\n✅ User created successfully!\n')
    print('Email:', data['user']['email'])
    print('Username:', data['user']['username'])
    print('Full Name:', data['user']['full_name'])
    print('Role:', data['user']['role'])
    print('\n📝 Use these credentials to login:')
    print('Email:', email)
    print('Password:', password)
else:
    print('Error:', resp.json())
