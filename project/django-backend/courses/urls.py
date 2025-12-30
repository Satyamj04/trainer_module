from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    ProfileViewSet, CourseViewSet, UnitViewSet, VideoUnitViewSet,
    AudioUnitViewSet, PresentationUnitViewSet, TextUnitViewSet,
    PageUnitViewSet, QuizViewSet, QuestionViewSet, AssignmentViewSet,
    ScormPackageViewSet, SurveyViewSet, EnrollmentViewSet,
    UnitProgressViewSet, AssignmentSubmissionViewSet, QuizAttemptViewSet,
    LeaderboardViewSet, MediaUploadViewSet, token_by_email, register
)

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'units', UnitViewSet)
router.register(r'video-units', VideoUnitViewSet)
router.register(r'audio-units', AudioUnitViewSet)
router.register(r'presentation-units', PresentationUnitViewSet)
router.register(r'text-units', TextUnitViewSet)
router.register(r'page-units', PageUnitViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'scorm-packages', ScormPackageViewSet)
router.register(r'surveys', SurveyViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'unit-progress', UnitProgressViewSet)
router.register(r'assignment-submissions', AssignmentSubmissionViewSet)
router.register(r'quiz-attempts', QuizAttemptViewSet)
router.register(r'leaderboard', LeaderboardViewSet)
router.register(r'media', MediaUploadViewSet, basename='media')

# Trainer-specific alias routes (keeps frontend compatibility with /trainer/v1/* paths)
from django.urls import path

trainer_urls = [
    # course list/create
    path('trainer/v1/course/', CourseViewSet.as_view({'get': 'list', 'post': 'create'}), name='trainer-course-list'),
    # course detail + actions
    path('trainer/v1/course/<uuid:pk>/', CourseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='trainer-course-detail'),
    path('trainer/v1/course/<uuid:pk>/publish/', CourseViewSet.as_view({'post': 'publish'}), name='trainer-course-publish'),
    path('trainer/v1/course/<uuid:pk>/duplicate/', CourseViewSet.as_view({'post': 'duplicate'}), name='trainer-course-duplicate'),
    path('trainer/v1/course/<uuid:pk>/sequence/', CourseViewSet.as_view({'get': 'sequence', 'put': 'sequence'}), name='trainer-course-sequence'),
    path('trainer/v1/course/<uuid:pk>/assign/', CourseViewSet.as_view({'post': 'assign'}), name='trainer-course-assign'),
    path('trainer/v1/course/<uuid:pk>/modules/', CourseViewSet.as_view({'get': 'units'}), name='trainer-course-modules'),
    # module-level preview
    path('trainer/module/<uuid:pk>/content/preview/', UnitViewSet.as_view({'post': 'preview_content'}), name='trainer-module-preview'),
]

urlpatterns = [
    path('auth/login/', obtain_auth_token, name='api_token_auth'),
    path('auth/register/', register, name='register'),
    path('auth/token_by_email/', token_by_email, name='token_by_email'),
    path('', include(router.urls)),
]

# append trainer aliases
urlpatterns += trainer_urls
