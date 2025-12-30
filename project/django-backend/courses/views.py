from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from django.db import IntegrityError
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

from .models import (
    Profile, Course, Unit, VideoUnit, AudioUnit, PresentationUnit,
    TextUnit, PageUnit, Quiz, Question, Assignment, ScormPackage,
    Survey, Enrollment, UnitProgress, AssignmentSubmission,
    QuizAttempt, Leaderboard, MediaMetadata, Team, TeamMember
)
from .serializers import (
    ProfileSerializer, CourseSerializer, CourseDetailSerializer,
    UnitSerializer, VideoUnitSerializer, AudioUnitSerializer,
    PresentationUnitSerializer, TextUnitSerializer, PageUnitSerializer,
    QuizSerializer, QuestionSerializer, AssignmentSerializer,
    ScormPackageSerializer, SurveySerializer, EnrollmentSerializer,
    UnitProgressSerializer, AssignmentSubmissionSerializer,
    QuizAttemptSerializer, LeaderboardSerializer, MediaMetadataSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def token_by_email(request):
    """Dev helper: return/create a DRF token for a user by email.
    POST {"email": "trainer_user@example.com"}
    """
    email = request.data.get('email')
    if not email:
        return Response({'error': 'email is required'}, status=400)
    try:
        user = Profile.objects.get(email=email)
    except Profile.DoesNotExist:
        return Response({'error': 'user not found'}, status=404)
    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user in the Django users table and return a DRF token.
    POST {"email": "trainer@example.com", "password": "pass", "full_name": "Trainer", "role": "trainer"}
    """
    email = request.data.get('email')
    password = request.data.get('password')
    full_name = request.data.get('full_name', '')
    role = request.data.get('role', 'trainee')
    if not email or not password:
        return Response({'error': 'email and password are required'}, status=400)
    # Use the full email as the username so frontend can login using email
    username = email
    first_name = ''
    last_name = ''
    if full_name:
        parts = full_name.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''
    try:
        # Basic validation
        if len(password) < 6:
            return Response({'error': 'Password must be at least 6 characters long'}, status=400)
        # Use the standard create_user helper to ensure password hashing
        user = Profile.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)
        user.primary_role = role
        user.save()
        token, _ = Token.objects.get_or_create(user=user)
        serializer = ProfileSerializer(user, context={'request': request})
        return Response({'token': token.key, 'user': serializer.data})
    except IntegrityError as e:
        # Friendly error messages for common unique constraint failures
        err_text = str(e)
        if 'users_email_key' in err_text or 'Key (email)' in err_text:
            msg = 'A user with this email already exists'
        elif 'users_username_key' in err_text or 'Key (username)' in err_text:
            msg = 'A user with this username already exists'
        else:
            msg = 'A user with these details already exists'
        return Response({'error': msg}, status=400)
    except Exception as e:
        # Generic error (avoid leaking DB internals)
        return Response({'error': 'Signup failed'}, status=400)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

    def get_queryset(self):
        user = self.request.user
        # align with Profile.primary_role mapping
        if getattr(user, 'primary_role', '') == 'trainer':
            return Course.objects.filter(created_by=user)
        return Course.objects.filter(enrollments__user=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def units(self, request, pk=None):
        course = self.get_object()
        units = course.units.all()
        serializer = UnitSerializer(units, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        course = self.get_object()
        course.status = 'published'
        course.save()
        return Response({'status': 'published'})

    # --- Trainer-only actions (aliases under /trainer/v1/* will point here) ---
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def duplicate(self, request, pk=None):
        """Duplicate a course (deep-copy metadata + modules/questions). Trainer only."""
        user = request.user
        if not (getattr(user, 'is_superuser', False) or getattr(user, 'primary_role', '') == 'trainer'):
            return Response({'detail': 'Trainer permission required'}, status=403)

        orig = self.get_object()
        # shallow clone course fields
        dup = Course.objects.create(
            title=f"{orig.title} (copy)",
            description=orig.description,
            about=orig.about,
            outcomes=orig.outcomes,
            course_type=orig.course_type,
            status='draft',
            is_mandatory=orig.is_mandatory,
            estimated_duration_hours=orig.estimated_duration_hours,
            passing_criteria=orig.passing_criteria,
            created_by=user
        )
        # clone units and their subtype data
        for unit in orig.units.all():
            new_unit = Unit.objects.create(
                course=dup,
                module_type=unit.module_type,
                title=unit.title,
                description=unit.description,
                sequence_order=unit.sequence_order,
                is_mandatory=unit.is_mandatory,
                estimated_duration_minutes=unit.estimated_duration_minutes,
                video_count=unit.video_count,
                has_quizzes=unit.has_quizzes
            )
            # clone subtype data where available; be defensive if subtype tables are missing
            try:
                if hasattr(unit, 'quiz_details') and unit.quiz_details:
                    quiz = unit.quiz_details
                    new_quiz = Quiz.objects.create(unit=new_unit, time_limit=quiz.time_limit, passing_score=quiz.passing_score, attempts_allowed=quiz.attempts_allowed, show_answers=quiz.show_answers, randomize_questions=quiz.randomize_questions, mandatory_completion=quiz.mandatory_completion)
                    for q in quiz.questions.all():
                        Question.objects.create(quiz=new_quiz, type=q.type, text=q.text, options=q.options, correct_answer=q.correct_answer, points=q.points, order=q.order)
            except Exception:
                # If related subtype tables are absent (e.g., quizzes table missing), skip cloning subtype data.
                continue
        # Attempt to return a full detail representation; if nested subtype tables are
        # missing, fall back to a minimal CourseSerializer to avoid raising a 500.
        try:
            serializer = CourseDetailSerializer(dup, context={'request': request})
            return Response(serializer.data)
        except Exception:
            # Fall back to a lightweight representation
            serializer = CourseSerializer(dup, context={'request': request})
            return Response(serializer.data)

    @action(detail=True, methods=['get', 'put'], permission_classes=[permissions.IsAuthenticated])
    def sequence(self, request, pk=None):
        """Get or update sequencing rules for a course."""
        user = request.user
        if not (user.is_superuser or getattr(user, 'primary_role', '') == 'trainer'):
            return Response({'detail': 'Trainer permission required'}, status=403)

        course = self.get_object()
        if request.method == 'GET':
            seq = ModuleSequencing.objects.filter(course=course)
            data = []
            for s in seq:
                data.append({
                    'sequence_id': str(s.sequence_id),
                    'module_id': str(s.module_id),
                    'preceding_module_id': str(s.preceding_module_id) if s.preceding_module_id else None,
                    'drip_feed_rule': s.drip_feed_rule,
                    'drip_feed_delay_days': s.drip_feed_delay_days,
                    'prerequisite_completed': s.prerequisite_completed
                })
            return Response(data)

        # PUT: replace sequencing rules atomically
        rules = request.data.get('rules', [])
        # basic validation
        ModuleSequencing.objects.filter(course=course).delete()
        created = []
        for r in rules:
            module = Unit.objects.get(id=r['module_id'])
            preceding = None
            if r.get('preceding_module_id'):
                preceding = Unit.objects.get(id=r['preceding_module_id'])
            ms = ModuleSequencing.objects.create(course=course, module=module, preceding_module=preceding, drip_feed_rule=r.get('drip_feed_rule','none'), drip_feed_delay_days=r.get('drip_feed_delay_days',0), prerequisite_completed=r.get('prerequisite_completed', False))
            created.append(str(ms.sequence_id))
        return Response({'created': created})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign(self, request, pk=None):
        """Assign course to list of users or teams. Input: {"user_ids":[], "team_ids":[]}"""
        user = request.user
        if not (user.is_superuser or getattr(user, 'primary_role', '') == 'trainer'):
            return Response({'detail': 'Trainer permission required'}, status=403)

        course = self.get_object()
        user_ids = request.data.get('user_ids', []) or []
        team_ids = request.data.get('team_ids', []) or []
        created = 0
        # assign explicit users
        for uid in user_ids:
            try:
                u = Profile.objects.get(id=uid)
                if not Enrollment.objects.filter(course=course, user=u).exists():
                    Enrollment.objects.create(course=course, user=u, assigned_by=user, status='assigned')
                    created += 1
            except Profile.DoesNotExist:
                continue
        # assign team members
        for tid in team_ids:
            members = TeamMember.objects.filter(team_id=tid).values_list('user_id', flat=True)
            for uid in members:
                try:
                    u = Profile.objects.get(id=uid)
                    if not Enrollment.objects.filter(course=course, user=u).exists():
                        Enrollment.objects.create(course=course, user=u, assigned_by=user, status='assigned')
                        created += 1
                except Profile.DoesNotExist:
                    continue
        return Response({'created': created})
    @action(detail=True, methods=['get'])
    def assignable_learners(self, request, pk=None):
        course = self.get_object()
        enrolled_user_ids = Enrollment.objects.filter(course=course).values_list('user_id', flat=True)
        # Use `primary_role` (actual field on Profile) — return trainees who are not already enrolled
        learners = Profile.objects.filter(primary_role='trainee').exclude(id__in=enrolled_user_ids)
        serializer = ProfileSerializer(learners, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def enrollment_stats(self, request, pk=None):
        course = self.get_object()
        enrollments = Enrollment.objects.filter(course=course)
        total_learners = Profile.objects.filter(role='learner').count()
        return Response({
            'total_enrolled': enrollments.count(),
            'total_learners': total_learners,
            'completed': enrollments.filter(status='completed').count(),
            'in_progress': enrollments.filter(status='in_progress').count(),
            'assigned': enrollments.filter(status='assigned').count()
        })


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return Unit.objects.filter(course_id=course_id)
        return Unit.objects.all()

    def create(self, request, *args, **kwargs):
        """Override create to auto-assign sequence_order and handle errors gracefully."""
        data = request.data.copy()
        course_id = data.get('course') or data.get('course_id')
        
        # Auto-assign sequence_order if not provided
        if data.get('sequence_order') is None and data.get('order') is None:
            if not course_id:
                return Response({'course': 'course is required'}, status=400)
            try:
                from django.db.models import Max
                result = Unit.objects.filter(course_id=course_id).aggregate(Max('sequence_order'))
                max_seq = result.get('sequence_order__max')
                next_seq = (max_seq if max_seq is not None else -1) + 1
                data['sequence_order'] = next_seq
            except Exception as e:
                return Response({'detail': f'Error calculating sequence order: {str(e)}'}, status=400)

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        
        try:
            unit = serializer.save()
        except Exception as exc:
            from django.db import IntegrityError
            if isinstance(exc, IntegrityError):
                return Response({'detail': 'Sequence order conflict - this position is already used'}, status=400)
            return Response({'detail': str(exc)}, status=500)

        resp = {
            'id': str(unit.id),
            'title': unit.title,
            'module_type': unit.module_type,
            'sequence_order': unit.sequence_order,
            'course': str(unit.course_id),
            'is_mandatory': unit.is_mandatory,
            'created_at': unit.created_at,
            'updated_at': unit.updated_at
        }
        return Response(resp, status=201)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def preview_content(self, request, pk=None):
        """Basic validation endpoint for module content preview (trainer-only)."""
        user = request.user
        if not (user.is_superuser or getattr(user, 'primary_role', '') == 'trainer'):
            return Response({'detail': 'Trainer permission required'}, status=403)

        module = self.get_object()
        payload = request.data.get('content') or {}
        # Simple validation: require title and at least one content item
        if not payload:
            return Response({'valid': False, 'errors': ['content payload missing']}, status=400)
        # Example checks
        errors = []
        if 'items' not in payload or not isinstance(payload['items'], list) or len(payload['items']) == 0:
            errors.append('items must be a non-empty list')
        if errors:
            return Response({'valid': False, 'errors': errors}, status=400)
        # For now, return success and echo a lightweight preview url placeholder
        return Response({'valid': True, 'preview_url': f"/preview/{module.id}/tmp"})


class VideoUnitViewSet(viewsets.ModelViewSet):
    queryset = VideoUnit.objects.all()
    serializer_class = VideoUnitSerializer
    permission_classes = [permissions.IsAuthenticated]


class AudioUnitViewSet(viewsets.ModelViewSet):
    queryset = AudioUnit.objects.all()
    serializer_class = AudioUnitSerializer
    permission_classes = [permissions.IsAuthenticated]


class PresentationUnitViewSet(viewsets.ModelViewSet):
    queryset = PresentationUnit.objects.all()
    serializer_class = PresentationUnitSerializer
    permission_classes = [permissions.IsAuthenticated]


class TextUnitViewSet(viewsets.ModelViewSet):
    queryset = TextUnit.objects.all()
    serializer_class = TextUnitSerializer
    permission_classes = [permissions.IsAuthenticated]


class PageUnitViewSet(viewsets.ModelViewSet):
    queryset = PageUnit.objects.all()
    serializer_class = PageUnitSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        quiz_id = self.request.query_params.get('quiz_id')
        if quiz_id:
            return Question.objects.filter(quiz_id=quiz_id)
        return Question.objects.all()


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class ScormPackageViewSet(viewsets.ModelViewSet):
    queryset = ScormPackage.objects.all()
    serializer_class = ScormPackageSerializer
    permission_classes = [permissions.IsAuthenticated]


class SurveyViewSet(viewsets.ModelViewSet):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = [permissions.IsAuthenticated]


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get('course_id')

        queryset = Enrollment.objects.all()
        if user.role == 'learner':
            queryset = queryset.filter(user=user)
        elif course_id:
            queryset = queryset.filter(course_id=course_id)

        return queryset

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        enrollment = self.get_object()
        progress = enrollment.unit_progress.all()
        serializer = UnitProgressSerializer(progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        course_id = request.data.get('course_id')
        user_ids = request.data.get('user_ids', [])

        if not course_id or not user_ids:
            return Response(
                {'error': 'course_id and user_ids are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        enrollments = []
        for user_id in user_ids:
            try:
                user = Profile.objects.get(id=user_id)
                if not Enrollment.objects.filter(course=course, user=user).exists():
                    enrollments.append(Enrollment(
                        course=course,
                        user=user,
                        assigned_by=request.user,
                        status='assigned'
                    ))
            except Profile.DoesNotExist:
                continue

        if enrollments:
            Enrollment.objects.bulk_create(enrollments)

        return Response({
            'created': len(enrollments),
            'message': f'{len(enrollments)} learners enrolled successfully'
        })


class UnitProgressViewSet(viewsets.ModelViewSet):
    queryset = UnitProgress.objects.all()
    serializer_class = UnitProgressSerializer
    permission_classes = [permissions.IsAuthenticated]


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'trainer':
            return AssignmentSubmission.objects.all()
        return AssignmentSubmission.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        submission = self.get_object()
        submission.score = request.data.get('score')
        submission.feedback = request.data.get('feedback')
        submission.status = 'graded'
        submission.graded_by = request.user
        submission.save()
        return Response({'status': 'graded'})


class QuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'learner':
            return QuizAttempt.objects.filter(user=user)
        return QuizAttempt.objects.all()


class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        queryset = Leaderboard.objects.all().order_by('rank')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset


class MediaUploadViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @action(detail=False, methods=['post'])
    def upload(self, request):
        file = request.FILES.get('file')
        file_type = request.data.get('type', 'general')

        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        filename = f"{user.id}/{file_type}/{file.name}"
        path = default_storage.save(filename, ContentFile(file.read()))
        url = default_storage.url(path)

        metadata = MediaMetadata.objects.create(
            storage_path=path,
            file_name=file.name,
            file_type=file_type,
            file_size=file.size,
            mime_type=file.content_type,
            uploaded_by=user
        )

        return Response({
            'url': url,
            'path': path,
            'metadata': MediaMetadataSerializer(metadata).data
        })
