import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')
import django
django.setup()
from rest_framework.test import APIClient
from courses.models import Profile
import psycopg2

# find a trainer user
trainer = Profile.objects.filter(primary_role='trainer').first()
if not trainer:
    print('No trainer found')
    sys.exit(1)

# find a course to assign
from courses.models import Course
course = Course.objects.first()
if not course:
    print('No course found')
    sys.exit(1)

# get a team id from DB (raw SQL to avoid ORM issues)
DB={'dbname':'lms','user':'postgres','password':'admin@123','host':'localhost','port':5432}
conn=psycopg2.connect(**DB)
cur=conn.cursor()
cur.execute("SELECT team_id FROM teams LIMIT 1")
row = cur.fetchone()
if not row:
    print('No teams found')
    sys.exit(1)
team_id = row[0]
cur.close(); conn.close()

client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'
client.force_authenticate(user=trainer)
resp = client.post(f'/api/trainer/v1/course/{course.id}/assign/', {'team_ids': [team_id]}, format='json')
print('Status:', resp.status_code, 'Response:', resp.data)