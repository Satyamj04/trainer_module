import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CourseList } from './components/CourseList';
import { CreateCourse } from './components/CreateCourse';
import { CourseBuilder } from './components/CourseBuilder';
import { VideoUnitEditor } from './components/units/VideoUnitEditor';
import { QuizEditor } from './components/units/QuizEditor';
import { EnrollmentManagement } from './components/Enrollment';
import { AssignCourse } from './components/AssignCourse';
import { Reports } from './components/Reports';
import { Leaderboard } from './components/Leaderboard';
import { CoursePreview } from './components/CoursePreview';

type Page =
  | 'dashboard'
  | 'courses'
  | 'create-course'
  | 'course-builder'
  | 'course-preview'
  | 'unit-editor-video'
  | 'unit-editor-quiz'
  | 'unit-editor-test'
  | 'enrollments'
  | 'assign-course'
  | 'reports'
  | 'leaderboard';

interface NavigationState {
  page: Page;
  data?: any;
}

function AppContent() {
  const { profile, loading } = useAuth();
  const [navState, setNavState] = useState<NavigationState>({
    page: 'dashboard'
  });

  const handleNavigate = (page: string, data?: any) => {
    setNavState({ page: page as Page, data });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <Login />;
  }

  if (profile.role !== 'trainer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This module is only accessible to trainers.</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (navState.page) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;

      case 'courses':
        return <CourseList onNavigate={handleNavigate} />;

      case 'create-course':
        return <CreateCourse onNavigate={handleNavigate} />;

      case 'course-builder':
        return navState.data?.courseId ? (
          <CourseBuilder
            courseId={navState.data.courseId}
            onNavigate={handleNavigate}
          />
        ) : (
          <div>Invalid course</div>
        );

      case 'unit-editor-video':
        return navState.data?.unitId ? (
          <VideoUnitEditor
            unitId={navState.data.unitId}
            onNavigate={handleNavigate}
          />
        ) : (
          <div>Invalid unit</div>
        );

      case 'unit-editor-quiz':
      case 'unit-editor-test':
        return navState.data?.unitId ? (
          <QuizEditor
            unitId={navState.data.unitId}
            onNavigate={handleNavigate}
          />
        ) : (
          <div>Invalid unit</div>
        );

      case 'enrollments':
        return navState.data?.courseId ? (
          <EnrollmentManagement
            courseId={navState.data.courseId}
            onNavigate={handleNavigate}
          />
        ) : (
          <div>Invalid course</div>
        );

      case 'course-preview':
        return navState.data?.courseId ? (
          <CoursePreview
            courseId={navState.data.courseId}
            onNavigate={handleNavigate}
          />
        ) : (
          <div>Invalid course</div>
        );

      case 'assign-course':
        return <AssignCourse onNavigate={handleNavigate} />;

      case 'reports':
        return <Reports />;

      case 'leaderboard':
        return <Leaderboard />;

      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (['course-builder', 'unit-editor-video', 'unit-editor-quiz', 'unit-editor-test'].includes(navState.page)) {
    return renderPage();
  }

  return (
    <Layout currentPage={navState.page} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
