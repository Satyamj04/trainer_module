"""Duplicate a course via trainer endpoint using DRF APIClient.
Usage: python scripts/duplicate_course_backend.py <course_id>
"""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()
from courses.models import Profile, Course
from rest_framework.authtoken.models import Token

if len(sys.argv) < 2:
    print('Provide course id')
    sys.exit(1)

course_id = sys.argv[1]

user = Profile.objects.filter(email='trainer_user@example.com').first()
if not user:
    print('trainer user not found')
    sys.exit(1)

token = Token.objects.get(user=user)

client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'
client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

resp = client.post(f'/api/trainer/v1/course/{course_id}/duplicate/')
print('Status:', resp.status_code)
try:
    print('Response:', resp.json())
except Exception as e:
    print('Response text:', resp.content)

# check DB for duplicated title
original = Course.objects.get(id=course_id)
dup = Course.objects.filter(title__icontains=original.title).exclude(id=original.id).first()
if dup:
    print('Duplicate found:', dup.id)
else:
    print('Duplicate not found')