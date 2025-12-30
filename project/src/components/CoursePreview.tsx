import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';

interface CoursePreviewProps {
  courseId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function CoursePreview({ courseId, onNavigate }: CoursePreviewProps) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await courseService.getCourse(courseId);
        setCourse(data);
      } catch (err: any) {
        console.error('Error loading course preview:', err);
        alert(`Failed to load course preview: ${err?.message || String(err)}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!course) return <div className="p-6">Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => onNavigate('courses')} className="p-2 hover:bg-gray-100 rounded-lg">
          Back
        </button>
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-600">{course.created_by_name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-2">Description</h2>
        <p className="text-gray-700">{course.description || 'No description'}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-2">Units</h2>
        {course.units && course.units.length > 0 ? (
          <ul className="list-disc pl-6">
            {course.units.map((u: any) => (
              <li key={u.id} className="mb-2">{u.title} <span className="text-xs text-gray-400">({u.module_type})</span></li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No units yet</p>
        )}
      </div>

      <div>
        <button onClick={() => onNavigate('course-builder', { courseId })} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Open Builder</button>
      </div>
    </div>
  );
}
