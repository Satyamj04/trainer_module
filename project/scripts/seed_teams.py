"""Seed teams and team members into Django DB for testing course assignment."""
import os, sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root, 'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
django.setup()
from courses.models import Profile, Team, TeamMember

# Create some learner users
emails = ['alice@example.com', 'bob@example.com', 'carol@example.com']
users = []
for email in emails:
    u, created = Profile.objects.get_or_create(email=email, defaults={
        'username': email.split('@')[0],
        'first_name': email.split('@')[0].capitalize(),
        'last_name': 'Learner',
        'primary_role': 'trainee'
    })
    if created:
        u.set_password('password')
        u.save()
        print('Created user', email)
    else:
        print('User exists', email)
    users.append(u)

# Create teams using raw SQL to avoid ORM SELECTs that reference *_id columns
import uuid
from django.utils import timezone
from django.db import connection

def ensure_team(team_name, description, manager_id=None, created_by_id=None):
    with connection.cursor() as cur:
        cur.execute("SELECT team_id FROM teams WHERE team_name = %s", [team_name])
        row = cur.fetchone()
        if row:
            return row[0]
        tid = str(uuid.uuid4())
        now = timezone.now()
        cur.execute(
            "INSERT INTO teams (team_id, team_name, description, status, manager_id, created_by, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            [tid, team_name, description, 'active', manager_id, created_by_id, now, now]
        )
        return tid

team1_id = ensure_team('Team Alpha', 'Alpha team', manager_id=users[0].id, created_by_id=users[0].id)
team2_id = ensure_team('Team Beta', 'Beta team', manager_id=users[1].id, created_by_id=users[1].id)
print('Ensured teams with ids:', team1_id, team2_id)

# Get Team model instances for use with ORM where possible
try:
    team1 = Team.objects.get(team_id=team1_id)
    team2 = Team.objects.get(team_id=team2_id)
except Exception:
    team1 = None
    team2 = None

# Add members; prefer ORM but fall back to raw SQL if necessary
from django.db import connection
for u in users:
    if team1:
        try:
            tm, created = TeamMember.objects.get_or_create(team=team1, user=u, defaults={'is_primary_team': False, 'assigned_by': users[0]})
            if created:
                print('Added', u.email, 'to', team1.team_name)
            continue
        except Exception as e:
            print('ORM add failed for', u.email, 'to', 'Team Alpha:', e)
    # Fallback raw SQL insert
    with connection.cursor() as cur:
        try:
            cur.execute("SELECT 1 FROM team_members WHERE team_id = %s AND user_id = %s", [team1_id, u.id])
            if not cur.fetchone():
                cur.execute("INSERT INTO team_members (team_id, user_id, is_primary_team, assigned_at, assigned_by) VALUES (%s, %s, %s, %s, %s)", [team1_id, u.id, False, timezone.now(), users[0].id])
                print('Inserted via SQL', u.email, 'to Team Alpha')
        except Exception as e:
            print('Could not insert via SQL', u.email, 'to Team Alpha:', e)

# Add one user to team2
if team2:
    try:
        tm, created = TeamMember.objects.get_or_create(team=team2, user=users[2], defaults={'is_primary_team': True, 'assigned_by': users[1]})
        if created:
            print('Added', users[2].email, 'to', team2.team_name)
    except Exception as e:
        print('ORM add failed for', users[2].email, 'to Team Beta:', e)
        with connection.cursor() as cur:
            try:
                cur.execute("SELECT 1 FROM team_members WHERE team_id = %s AND user_id = %s", [team2_id, users[2].id])
                if not cur.fetchone():
                    cur.execute("INSERT INTO team_members (team_id, user_id, is_primary_team, assigned_at, assigned_by) VALUES (%s, %s, %s, %s, %s)", [team2_id, users[2].id, True, timezone.now(), users[1].id])
                    print('Inserted via SQL', users[2].email, 'to Team Beta')
            except Exception as e2:
                print('Could not insert via SQL', users[2].email, 'to Team Beta:', e2)

print('Seeding complete')