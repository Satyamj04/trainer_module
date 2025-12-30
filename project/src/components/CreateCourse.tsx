import { useState } from 'react';
import { courseService } from '../services/courseService';
import { storageService } from '../services/storageService';
import { ArrowLeft, Upload, Save } from 'lucide-react';

interface CreateCourseProps {
  onNavigate: (page: string, data?: any) => void;
}

export function CreateCourse({ onNavigate }: CreateCourseProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    language: 'English',
    status: 'draft' as 'draft' | 'published',
    visibility: 'private' as 'private' | 'public' | 'restricted',
    sequential_access: false,
    completion_rule: 'all_units' as 'all_units' | 'required_units',
    certificate_enabled: false
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Technology',
    'Business',
    'Marketing',
    'Design',
    'Development',
    'Data Science',
    'Personal Development',
    'Health & Fitness',
    'Language Learning',
    'Other'
  ];

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Portuguese',
    'Arabic',
    'Hindi',
    'Other'
  ];

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnail_url = '';
      if (thumbnailFile) {
        const { url } = await storageService.uploadThumbnail(thumbnailFile);
        thumbnail_url = url;
      }

      // Use backend endpoint to ensure course is persisted to Django DB
      const course = await courseService.createCourseBackend({
        ...formData,
        status: publish ? 'published' : 'draft',
        thumbnail_url
      });

      onNavigate('course-builder', { courseId: course.id });
    } catch (error: any) {
      console.error('Error creating course:', error);
      // Surface helpful instructions if RLS/permissions are the root cause
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('row-level security') || msg.includes('permission') || msg.includes('trainer token')) {
        alert(`Failed to create course: ${error?.message}\n\nQuick fix: ensure you're signed in as a trainer or set a DRF trainer token in localStorage.\nRun: python project/scripts/create_token_sql.py trainer_user@example.com\nThen in browser console run: localStorage.setItem("trainerToken","<token>")`);
      } else {
        alert(`Failed to create course: ${error?.message || String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('courses')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-1">Set up your course details</p>
        </div>
      </div>

      <form className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              placeholder="Describe your course"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Thumbnail
            </label>
            <div className="flex items-center gap-4">
              {thumbnailPreview && (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-32 h-32 object-cover rounded-lg" />
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Course Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Rule
              </label>
              <select
                value={formData.completion_rule}
                onChange={(e) => setFormData({ ...formData, completion_rule: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all_units">All Units Completed</option>
                <option value="required_units">Required Units Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sequential_access}
                onChange={(e) => setFormData({ ...formData, sequential_access: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Sequential Access</p>
                <p className="text-sm text-gray-600">Learners must complete units in order</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.certificate_enabled}
                onChange={(e) => setFormData({ ...formData, certificate_enabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Certificate Enabled</p>
                <p className="text-sm text-gray-600">Award certificate upon course completion</p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Publishing Controls</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading || !formData.title}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span className="font-medium">Save as Draft</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading || !formData.title}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium">
                {loading ? 'Creating...' : 'Publish Course'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
