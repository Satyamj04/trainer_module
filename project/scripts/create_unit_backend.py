"""Create a unit via backend API for a course"""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient

django.setup()
from courses.models import Profile, Course, Unit
from rest_framework.authtoken.models import Token

trainer_email = 'trainer_user@example.com'
try:
    trainer = Profile.objects.get(email=trainer_email)
except Profile.DoesNotExist:
    print('trainer not found')
    sys.exit(1)
try:
    token = Token.objects.get(user=trainer)
except Token.DoesNotExist:
    print('token not found')
    sys.exit(1)

course = Course.objects.filter(title__icontains='English Grammer').first()
if not course:
    print('course not found')
    sys.exit(1)

client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'
client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
import json
payload = {'course': str(course.id), 'type': 'video', 'module_type': 'video', 'title': 'grammer'}
print('Payload:', json.dumps(payload))
resp = client.post('/api/units/', data=json.dumps(payload), content_type='application/json')
print('Status:', resp.status_code)
try:
    print('Resp:', resp.json())
except Exception:
    print('Content:', resp.content)

u = Unit.objects.filter(title__icontains='grammer').first()
if u:
    print('Unit found:', u.id, u.module_type)
else:
    print('Unit not found')
