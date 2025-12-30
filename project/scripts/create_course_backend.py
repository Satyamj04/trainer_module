"""Create a course via the trainer backend endpoints using DRF APIClient.
Usage: python scripts/create_course_backend.py
"""
import os
import sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()
from courses.models import Profile, Course
from rest_framework.authtoken.models import Token

email = 'trainer_user@example.com'
try:
    user = Profile.objects.get(email=email)
except Profile.DoesNotExist:
    print('trainer user not found')
    sys.exit(1)
try:
    token = Token.objects.get(user=user)
except Token.DoesNotExist:
    print('token not found')
    sys.exit(1)

client = APIClient()
# use allowed host to avoid DisallowedHost in tests
client.defaults['HTTP_HOST'] = 'localhost'
client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

payload = {'title': 'English Grammer', 'description': 'Testing creation via backend'}
resp = client.post('/api/trainer/v1/course/', data=payload, format='json')
print('Status code:', resp.status_code)
try:
    print('Response:', resp.json())
except Exception as e:
    print('Response content:', resp.content)

# verify in DB
course = Course.objects.filter(title__icontains='English Grammer').first()
if course:
    print('Course found in DB:', course.id)
else:
    print('Course not found in DB')
