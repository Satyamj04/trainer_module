"""Run an authenticated smoke test against trainer endpoints using DRF's APIClient."""
import os
import sys
proj_root = os.path.dirname(os.path.dirname(__file__))
# Add the Django project package directory so `trainer_lms` can be imported
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from rest_framework.test import APIClient


def run_smoke():
    django.setup()
    # import models after Django is set up
    from courses.models import Profile, Course
    from rest_framework.authtoken.models import Token
    # get trainer user
    try:
        user = Profile.objects.get(email='trainer_user@example.com')
    except Profile.DoesNotExist:
        print('trainer_user@example.com not found')
        return
    token = None
    try:
        token = Token.objects.get(user=user)
    except Token.DoesNotExist:
        print('Token for user not found')
        return

    client = APIClient()
    # Use a host allowed by Django settings to avoid DisallowedHost in tests
    client.defaults['HTTP_HOST'] = 'localhost'
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    # Ensure there is a course created by this trainer
    course = Course.objects.filter(created_by=user).first()
    if not course:
        course = Course.objects.create(title='Smoke Course', description='Created by smoke test', created_by=user)
        print('Created smoke course', course.id)

    # Hit trainer list endpoint
    # API is mounted under /api/ per project urls
    resp = client.get('/api/trainer/v1/course/')
    print('Status code:', resp.status_code)
    try:
        print('Response JSON keys:', list(resp.json().keys()) if isinstance(resp.json(), dict) else 'non-dict response')
    except Exception as e:
        print('Could not parse JSON:', e)

if __name__ == '__main__':
    run_smoke()
