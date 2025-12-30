from django.conf import settings
import os
import django
import sys

# Ensure project root is on PYTHONPATH so `trainer_lms` package imports
# Ensure Django project package is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'django-backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

django.setup()
from courses.models import Profile, Course, Unit

# use existing seeded user if present
user = Profile.objects.filter(email='smoke_user@example.com').first()
if not user:
    raise SystemExit('No seeded user found; run scripts/seed_user_sql.py first')

course = Course.objects.create(title='Smoke Course', created_by=user)
unit = Unit.objects.create(course=course, module_type='video', title='Unit 1', sequence_order=1)
print('Created', course.id, unit.id)
print('Unit table name:', Unit._meta.db_table)
print('Unit record:', Unit.objects.filter(id=unit.id).values())