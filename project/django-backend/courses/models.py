from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid


class Profile(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='user_id')
    # Use first_name / last_name of AbstractUser; expose full_name via serializer
    # Map Django user fields to DDL columns
    password = models.CharField(max_length=255, db_column='password_hash')
    is_superuser = models.BooleanField(default=False, db_column='is_superuser')
    is_staff = models.BooleanField(default=False, db_column='is_staff')
    is_active = models.BooleanField(default=True, db_column='is_active')

    primary_role = models.CharField(
        max_length=50,
        db_column='primary_role',
        choices=[('admin','admin'), ('trainer','trainer'), ('manager','manager'), ('trainee','trainee')],
        default='trainee'
    )
    profile_image_url = models.TextField(blank=True, null=True, db_column='profile_image_url')
    last_login = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'users'

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='course_id')
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    outcomes = models.TextField(blank=True, null=True)
    course_type = models.CharField(max_length=30, default='self_paced')
    status = models.CharField(max_length=20, default='draft')
    is_mandatory = models.BooleanField(default=False, db_column='is_mandatory')
    estimated_duration_hours = models.IntegerField(blank=True, null=True)
    passing_criteria = models.IntegerField(default=70)
    created_by = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='created_courses', db_column='created_by')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']


class Unit(models.Model):
    """Mapped to the DDL `modules` table (module-level metadata)."""

    MODULE_TYPES = [
        ('text', 'Text'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('presentation', 'Presentation'),
        ('scorm', 'SCORM'),
        ('xapi', 'xAPI'),
        ('quiz', 'Quiz'),
        ('test', 'Test'),
        ('assignment', 'Assignment'),
        ('survey', 'Survey'),
        ('page', 'Page'),
        ('mixed', 'Mixed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='module_id')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='units', db_column='course_id')
    module_type = models.CharField(max_length=30, choices=MODULE_TYPES, db_column='module_type')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    sequence_order = models.IntegerField(default=0, db_column='sequence_order')
    is_mandatory = models.BooleanField(default=True, db_column='is_mandatory')
    estimated_duration_minutes = models.IntegerField(blank=True, null=True)
    video_count = models.IntegerField(default=0)
    has_quizzes = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'modules'
        ordering = ['course', 'sequence_order']
        constraints = [
            models.UniqueConstraint(fields=['course', 'sequence_order'], name='uq_module_sequence')
        ]

    @property
    def order(self):
        """Backward-compatible alias for `sequence_order` used by older front-end code."""
        return self.sequence_order

    @order.setter
    def order(self, value):
        self.sequence_order = value


class VideoUnit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='video_details')
    video_url = models.URLField(blank=True, null=True)
    video_storage_path = models.CharField(max_length=500, blank=True, null=True)
    duration = models.IntegerField(default=0)
    completion_type = models.CharField(
        max_length=20,
        choices=[('full', 'Full'), ('percentage', 'Percentage')],
        default='full'
    )
    required_watch_percentage = models.IntegerField(default=100)
    allow_skip = models.BooleanField(default=False)
    allow_rewind = models.BooleanField(default=True)

    class Meta:
        db_table = 'video_units'


class AudioUnit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='audio_details')
    audio_url = models.URLField(blank=True, null=True)
    audio_storage_path = models.CharField(max_length=500, blank=True, null=True)
    duration = models.IntegerField(default=0)

    class Meta:
        db_table = 'audio_units'


class PresentationUnit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='presentation_details')
    file_url = models.URLField(blank=True, null=True)
    file_storage_path = models.CharField(max_length=500, blank=True, null=True)
    slide_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'presentation_units'


class TextUnit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='text_details')
    content = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'text_units'


class PageUnit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='page_details')
    content = models.JSONField(default=list)
    version = models.IntegerField(default=1)

    class Meta:
        db_table = 'page_units'


class Quiz(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='quiz_details')
    time_limit = models.IntegerField(blank=True, null=True)
    passing_score = models.IntegerField(default=70)
    attempts_allowed = models.IntegerField(default=1)
    show_answers = models.BooleanField(default=False)
    randomize_questions = models.BooleanField(default=False)
    mandatory_completion = models.BooleanField(default=False)

    class Meta:
        db_table = 'quizzes'


class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('multiple_answer', 'Multiple Answer'),
        ('true_false', 'True/False'),
        ('fill_blank', 'Fill in the Blank'),
        ('matching', 'Matching'),
        ('ordering', 'Ordering'),
        ('free_text', 'Free Text'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    text = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.JSONField(blank=True, null=True)
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'questions'
        ordering = ['quiz', 'order']


class Assignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='assignment_id')
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='assignment_details', db_column='module_id')
    submission_type = models.CharField(
        max_length=20,
        choices=[('file', 'File'), ('text', 'Text'), ('both', 'Both')],
        default='both'
    )
    due_date = models.DateTimeField(blank=True, null=True)
    max_score = models.IntegerField(default=100)
    instructions = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'assignments'


class ScormPackage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='scorm_details')
    package_type = models.CharField(
        max_length=20,
        choices=[('scorm_1_2', 'SCORM 1.2'), ('scorm_2004', 'SCORM 2004'), ('xapi', 'xAPI')],
        blank=True,
        null=True
    )
    file_url = models.URLField(blank=True, null=True)
    file_storage_path = models.CharField(max_length=500, blank=True, null=True)
    version = models.CharField(max_length=50, blank=True, null=True)
    completion_tracking = models.BooleanField(default=True)
    score_tracking = models.BooleanField(default=True)

    class Meta:
        db_table = 'scorm_packages'


class Survey(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='survey_details')
    questions = models.JSONField(default=list)
    allow_anonymous = models.BooleanField(default=False)

    class Meta:
        db_table = 'surveys'


class Enrollment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='enrollments')
    assigned_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_enrollments')
    status = models.CharField(
        max_length=20,
        choices=[('assigned', 'Assigned'), ('in_progress', 'In Progress'), ('completed', 'Completed')],
        default='assigned'
    )
    progress_percentage = models.IntegerField(default=0)
    assigned_at = models.DateTimeField(default=timezone.now)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ['course', 'user']


class UnitProgress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='unit_progress')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='progress')
    status = models.CharField(
        max_length=20,
        choices=[('not_started', 'Not Started'), ('in_progress', 'In Progress'), ('completed', 'Completed')],
        default='not_started'
    )
    watch_percentage = models.IntegerField(default=0)
    score = models.IntegerField(blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'unit_progress'
        unique_together = ['enrollment', 'unit']


class AssignmentSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='assignment_submissions')
    submission_type = models.CharField(max_length=20, blank=True, null=True)
    submission_text = models.TextField(blank=True, null=True)
    submission_file_url = models.URLField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('graded', 'Graded')],
        default='pending'
    )
    submitted_at = models.DateTimeField(default=timezone.now)
    graded_at = models.DateTimeField(blank=True, null=True)
    graded_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions')

    class Meta:
        db_table = 'assignment_submissions'


class QuizAttempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=dict)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'quiz_attempts'


class Leaderboard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='leaderboard_entries')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='leaderboard_entries', blank=True, null=True)
    total_points = models.IntegerField(default=0)
    completed_units = models.IntegerField(default=0)
    quiz_score_total = models.IntegerField(default=0)
    activity_points = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leaderboard'
        unique_together = ['user', 'course']


class ModuleSequencing(models.Model):
    sequence_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='module_sequencing')
    module = models.ForeignKey('Unit', on_delete=models.CASCADE, related_name='sequencing')
    preceding_module = models.ForeignKey('Unit', on_delete=models.CASCADE, related_name='+', blank=True, null=True)
    drip_feed_rule = models.CharField(max_length=30, default='none')
    drip_feed_delay_days = models.IntegerField(default=0)
    prerequisite_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'module_sequencing'
        constraints = [models.UniqueConstraint(fields=['course', 'module'], name='uq_module_seq')]


class ModuleCompletion(models.Model):
    completion_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    module = models.ForeignKey('Unit', on_delete=models.CASCADE, related_name='completions')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='module_completions')
    completion_percentage = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    time_spent_minutes = models.IntegerField(default=0)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'module_completions'
        constraints = [models.UniqueConstraint(fields=['module', 'user'], name='uq_module_completion')]


class Note(models.Model):
    note_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='notes')
    module = models.ForeignKey('Unit', on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notes'


class Role(models.Model):
    role_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'roles'


class UserRole(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(default=timezone.now)
    assigned_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')

    class Meta:
        db_table = 'user_roles'
        constraints = [models.UniqueConstraint(fields=['user', 'role'], name='user_role_pk')]


class Team(models.Model):
    team_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team_name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='active')
    manager = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_teams')
    created_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teams'


class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    is_primary_team = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(default=timezone.now)
    assigned_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')

    class Meta:
        db_table = 'team_members'
        constraints = [models.UniqueConstraint(fields=['team', 'user'], name='team_member_pk')]


class MediaMetadata(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    storage_path = models.CharField(max_length=500, unique=True)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.BigIntegerField(blank=True, null=True)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True)
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    uploaded_by = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='uploaded_media')
    uploaded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'media_metadata'
