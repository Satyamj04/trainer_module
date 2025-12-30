from django.contrib import admin
from .models import (
    Profile, Course, Unit, VideoUnit, AudioUnit, PresentationUnit,
    TextUnit, PageUnit, Quiz, Question, Assignment, ScormPackage,
    Survey, Enrollment, UnitProgress, AssignmentSubmission,
    QuizAttempt, Leaderboard, MediaMetadata
)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'full_name', 'primary_role', 'created_at']
    list_filter = ['primary_role', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['title', 'module_type', 'course', 'sequence_order', 'is_mandatory']
    list_filter = ['module_type', 'is_mandatory']
    search_fields = ['title']
    ordering = ['course', 'sequence_order']


@admin.register(VideoUnit)
class VideoUnitAdmin(admin.ModelAdmin):
    list_display = ['unit', 'duration', 'completion_type', 'required_watch_percentage']


@admin.register(AudioUnit)
class AudioUnitAdmin(admin.ModelAdmin):
    list_display = ['unit', 'duration']


@admin.register(PresentationUnit)
class PresentationUnitAdmin(admin.ModelAdmin):
    list_display = ['unit', 'slide_count']


@admin.register(TextUnit)
class TextUnitAdmin(admin.ModelAdmin):
    list_display = ['unit']


@admin.register(PageUnit)
class PageUnitAdmin(admin.ModelAdmin):
    list_display = ['unit', 'version']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['unit', 'passing_score', 'attempts_allowed', 'time_limit']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'type', 'text', 'points', 'order']
    list_filter = ['type']
    ordering = ['quiz', 'order']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['unit', 'submission_type', 'due_date', 'max_score']
    list_filter = ['submission_type']


@admin.register(ScormPackage)
class ScormPackageAdmin(admin.ModelAdmin):
    list_display = ['unit', 'package_type', 'version', 'completion_tracking']


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ['unit', 'allow_anonymous']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'status', 'progress_percentage', 'assigned_at']
    list_filter = ['status', 'assigned_at']
    search_fields = ['user__username', 'course__title']


@admin.register(UnitProgress)
class UnitProgressAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'unit', 'status', 'watch_percentage', 'score']
    list_filter = ['status']


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'user', 'status', 'score', 'submitted_at']
    list_filter = ['status', 'submitted_at']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'user', 'score', 'passed', 'started_at']
    list_filter = ['passed', 'started_at']


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'total_points', 'rank', 'updated_at']
    list_filter = ['updated_at']
    ordering = ['rank']


@admin.register(MediaMetadata)
class MediaMetadataAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'file_type', 'uploaded_by', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['file_name']
