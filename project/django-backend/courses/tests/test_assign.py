from django.test import TestCase
from rest_framework.test import APIClient
from courses.models import Profile, Course, Team, TeamMember, Enrollment

class AssignFlowTest(TestCase):
    def setUp(self):
        # create trainer and learners
        self.trainer = Profile.objects.create_user(username='trainer1', email='trainer1@example.com', password='password')
        self.trainer.primary_role = 'trainer'
        self.trainer.save()
        self.learner1 = Profile.objects.create_user(username='learner1', email='learner1@example.com', password='password')
        self.learner1.primary_role = 'trainee'
        self.learner1.save()
        self.learner2 = Profile.objects.create_user(username='learner2', email='learner2@example.com', password='password')
        self.learner2.primary_role = 'trainee'
        self.learner2.save()

        # create team and members
        self.team = Team.objects.create(team_name='TestTeam', description='desc', created_by=self.trainer, manager=self.trainer)
        TeamMember.objects.create(team=self.team, user=self.learner1, is_primary_team=True, assigned_by=self.trainer)
        TeamMember.objects.create(team=self.team, user=self.learner2, is_primary_team=False, assigned_by=self.trainer)

        # create course by trainer
        self.course = Course.objects.create(title='T', created_by=self.trainer)

    def test_assign_team_creates_enrollments(self):
        client = APIClient()
        client.force_authenticate(user=self.trainer)
        resp = client.post(f'/api/trainer/v1/course/{self.course.id}/assign/', {'team_ids': [str(self.team.team_id)]}, format='json')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # Expect 2 enrollments created
        self.assertEqual(data.get('created'), 2)
        self.assertEqual(Enrollment.objects.filter(course=self.course).count(), 2)
