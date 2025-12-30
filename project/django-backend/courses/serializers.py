from rest_framework import serializers
from .models import (
    Profile, Course, Unit, VideoUnit, AudioUnit, PresentationUnit,
    TextUnit, PageUnit, Quiz, Question, Assignment, ScormPackage,
    Survey, Enrollment, UnitProgress, AssignmentSubmission,
    QuizAttempt, Leaderboard, MediaMetadata
)


class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='primary_role')
    avatar_url = serializers.CharField(source='profile_image_url', allow_null=True)

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'full_name', 'role', 'avatar_url', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_full_name(self, obj):
        return obj.full_name


class VideoUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoUnit
        fields = '__all__'


class AudioUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioUnit
        fields = '__all__'


class PresentationUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PresentationUnit
        fields = '__all__'


class TextUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextUnit
        fields = '__all__'


class PageUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageUnit
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = '__all__'


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'


class ScormPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScormPackage
        fields = '__all__'


class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        fields = '__all__'


class UnitSerializer(serializers.ModelSerializer):
    # Backwards-compatible fields: accept `type` and `order` from frontend
    type = serializers.CharField(source='module_type')
    order = serializers.IntegerField(source='sequence_order', required=False)

    video_details = VideoUnitSerializer(read_only=True)
    audio_details = AudioUnitSerializer(read_only=True)
    presentation_details = PresentationUnitSerializer(read_only=True)
    text_details = TextUnitSerializer(read_only=True)
    page_details = PageUnitSerializer(read_only=True)
    quiz_details = QuizSerializer(read_only=True)
    assignment_details = AssignmentSerializer(read_only=True)
    scorm_details = ScormPackageSerializer(read_only=True)
    survey_details = SurveySerializer(read_only=True)

    class Meta:
        model = Unit
        # include all model fields plus the alias fields above
        fields = '__all__'

    def validate(self, attrs):
        """Ensure sequence_order is unique per course and provide a clear error.

        This avoids leaking a 500 IntegrityError back to the client when a
        duplicate sequence_order is provided.
        """
        course = attrs.get('course')
        seq = attrs.get('sequence_order')

        # Only validate when both course and sequence_order are present
        if course is not None and seq is not None:
            qs = Unit.objects.filter(course=course, sequence_order=seq)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({'sequence_order': 'This sequence position is already in use for the course.'})

        return attrs


class CourseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    units_count = serializers.IntegerField(source='units.count', read_only=True)

    class Meta:
        model = Course
        fields = '__all__'
        # created_by is set server-side in perform_create; mark it read-only so clients don't need to provide it
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class CourseDetailSerializer(serializers.ModelSerializer):
    units = UnitSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'


class UnitProgressSerializer(serializers.ModelSerializer):
    unit_title = serializers.CharField(source='unit.title', read_only=True)

    class Meta:
        model = UnitProgress
        fields = '__all__'


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = '__all__'


class QuizAttemptSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = '__all__'


class LeaderboardSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Leaderboard
        fields = '__all__'


class MediaMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaMetadata
        fields = '__all__'
