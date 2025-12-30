import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import { Plus, BookOpen, Edit, Trash2, Eye, UserPlus, Copy } from 'lucide-react';

interface CourseListProps {
  onNavigate: (page: string, data?: any) => void;
}

export function CourseList({ onNavigate }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await courseService.deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm('Duplicate this course?')) return;
    setDuplicating(id);
    try {
      await courseService.duplicateCourse(id);
      alert('Course duplicated');
      await loadCourses();
    } catch (error: any) {
      console.error('Error duplicating course:', error);
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('row-level security') || msg.includes('permission') || msg.includes('trainer token')) {
        alert(`Failed to duplicate course: ${error?.message}\n\nQuick fix: create or set a DRF trainer token in localStorage.\nRun: python project/scripts/create_token_sql.py trainer_user@example.com\nThen in browser console run: localStorage.setItem("trainerToken","<token>")`);
      } else {
        alert(`Failed to duplicate course: ${error?.message || String(error)}`);
      }
    } finally {
      setDuplicating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">Manage your training courses</p>
        </div>
        <button
          onClick={() => onNavigate('create-course')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create Course</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first course</p>
          <button
            onClick={() => onNavigate('create-course')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Course</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {course.description || 'No description'}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  {course.category && (
                    <span className="px-2 py-1 bg-gray-100 rounded">{course.category}</span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 rounded">{course.language}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('course-builder', { courseId: course.id })}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => onNavigate('enrollments', { courseId: course.id })}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="text-sm font-medium">Assign</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('course-preview', { courseId: course.id })}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Preview</span>
                    </button>
                    <button
                      onClick={() => handleDuplicate(course.id)}
                      disabled={duplicating === course.id}
                      className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">{duplicating === course.id ? 'Duplicating...' : 'Duplicate'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
