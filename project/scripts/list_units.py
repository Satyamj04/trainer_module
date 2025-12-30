"""List units for a given course id"""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
django.setup()
from courses.models import Course, Unit

course_id = '91474dce-2be5-4620-bc3a-7448cf6beef4'
try:
    course = Course.objects.get(id=course_id)
except Course.DoesNotExist:
    print('course not found')
    sys.exit(1)

for u in Unit.objects.filter(course=course).order_by('sequence_order'):
    print(u.id, u.title, u.sequence_order)

from django.db.models import Max
mx = Unit.objects.filter(course=course).aggregate(max=Max('sequence_order'))['max']
print('max_seq:', mx)