import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { Course } from '../types';
import { UserPlus, Search, Users, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface AssignCourseProps {
  onNavigate: (page: string, data?: any) => void;
}

interface CourseWithStats extends Course {
  enrollmentCount?: number;
  totalLearners?: number;
}

export function AssignCourse({ onNavigate }: AssignCourseProps) {
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [learners, setLearners] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLearners, setSelectedLearners] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  // When a course is selected, load available learners for that specific course
  useEffect(() => {
    if (selectedCourse) fetchAssignableLearners(selectedCourse);
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const coursesData = await courseService.getCourses();
      const coursesWithStats = await Promise.all(
        coursesData.map(async (course) => {
          const enrollments = await enrollmentService.getEnrollments(course.id);
          return {
            ...course,
            enrollmentCount: enrollments.length,
            totalLearners: 0 // will be set when learners are loaded for a course
          };
        })
      );

      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignableLearners = async (courseId: string) => {
    setLoading(true);
    try {
      const list = await courseService.getAssignableLearners(courseId);
      setLearners(list);
      setCourses(c => c.map(course => course.id === courseId ? { ...course, totalLearners: list.length } : course));
    } catch (error: any) {
      console.error('Error loading learners:', error);
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('row-level security') || msg.includes('permission') || msg.includes('trainer token')) {
        alert(`Failed to load learners: ${error?.message}\n\nQuick fix: ensure you're signed in as a trainer or set a DRF trainer token in localStorage.\nRun: python project/scripts/create_token_sql.py trainer_user@example.com\nThen in browser console run: localStorage.setItem("trainerToken","<token>")`);
      }
      setLearners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCourse || selectedLearners.length === 0) {
      alert('Please select a course and at least one learner');
      return;
    }

    setAssigning(true);
    try {
      await enrollmentService.bulkCreateEnrollments(selectedCourse, selectedLearners);
      alert(`Successfully assigned course to ${selectedLearners.length} learner${selectedLearners.length !== 1 ? 's' : ''}`);
      setSelectedLearners([]);
      setSelectedCourse(null);
      loadData();
    } catch (error) {
      console.error('Error assigning course:', error);
      alert('Failed to assign course. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const getEnrolledLearnerIds = (courseId: string) => {
    return new Set<string>();
  };

  const filteredLearners = learners.filter(l =>
    l.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assign Courses</h1>
        <p className="text-gray-600 mt-1">Assign courses to learners quickly and efficiently</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Select Course</h2>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No courses available</p>
              <p className="text-sm">Create a course first to assign it to learners</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedCourse === course.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {course.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{course.enrollmentCount} enrolled</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          course.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                    {selectedCourse === course.id && (
                      <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Select Learners</h2>
          </div>

          {!selectedCourse ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a course first to see available learners</p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search learners..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {filteredLearners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No learners found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  <button
                    onClick={() => {
                      if (selectedLearners.length === filteredLearners.length) {
                        setSelectedLearners([]);
                      } else {
                        setSelectedLearners(filteredLearners.map(l => l.id));
                      }
                    }}
                    className="w-full text-left px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
                  >
                    {selectedLearners.length === filteredLearners.length ? 'Deselect All' : 'Select All'}
                  </button>

                  {filteredLearners.map((learner) => (
                    <label
                      key={learner.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLearners.includes(learner.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLearners([...selectedLearners, learner.id]);
                          } else {
                            setSelectedLearners(selectedLearners.filter(id => id !== learner.id));
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{learner.full_name}</p>
                        <p className="text-sm text-gray-600 truncate">{learner.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Assignment Summary</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCourse ? (
                <>
                  Assigning <span className="font-semibold">{courses.find(c => c.id === selectedCourse)?.title}</span> to{' '}
                  <span className="font-semibold">{selectedLearners.length}</span> learner{selectedLearners.length !== 1 ? 's' : ''}
                </>
              ) : (
                'No course or learners selected'
              )}
            </p>
          </div>
          <button
            onClick={handleAssign}
            disabled={!selectedCourse || selectedLearners.length === 0 || assigning}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">
              {assigning ? 'Assigning...' : 'Assign Course'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
