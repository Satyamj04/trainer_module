"""Create sample trainer and learner users for manual testing."""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
django.setup()
from courses.models import Profile

users = [
    {'email': 'trainer_user@example.com', 'username': 'trainer', 'first_name': 'Trainer', 'primary_role': 'trainer', 'password': 'password'},
    {'email': 'learner1@example.com', 'username': 'learner1', 'first_name': 'Learner1', 'primary_role': 'trainee', 'password': 'password'},
    {'email': 'learner2@example.com', 'username': 'learner2', 'first_name': 'Learner2', 'primary_role': 'trainee', 'password': 'password'},
    {'email': 'learner3@example.com', 'username': 'learner3', 'first_name': 'Learner3', 'primary_role': 'trainee', 'password': 'password'},
]

for u in users:
    obj, created = Profile.objects.get_or_create(email=u['email'], defaults={
        'username': u['username'], 'first_name': u['first_name'], 'primary_role': u['primary_role']
    })
    if created:
        obj.set_password(u['password'])
        obj.save()
        print('Created', u['email'])
    else:
        # ensure role and password
        updated = False
        if obj.primary_role != u['primary_role']:
            obj.primary_role = u['primary_role']
            updated = True
        try:
            obj.set_password(u['password'])
            updated = True
        except Exception:
            pass
        if updated:
            obj.save()
            print('Updated', u['email'])
        else:
            print('User exists', u['email'])

print('Seeding sample users complete')