import { useEffect, useState } from 'react';
import { enrollmentService } from '../services/enrollmentService';
import { Enrollment } from '../types';
import { ArrowLeft, Plus, UserPlus, Trash2, Search } from 'lucide-react';

interface EnrollmentProps {
  courseId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function EnrollmentManagement({ courseId, onNavigate }: EnrollmentProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [learners, setLearners] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLearners, setSelectedLearners] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const [enrollmentsData, learnersData] = await Promise.all([
        enrollmentService.getEnrollments(courseId),
        enrollmentService.getLearners()
      ]);
      setEnrollments(enrollmentsData);
      setLearners(learnersData);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnrollments = async () => {
    if (selectedLearners.length === 0) {
      alert('Please select at least one learner');
      return;
    }

    try {
      await enrollmentService.bulkCreateEnrollments(courseId, selectedLearners);
      alert('Learners enrolled successfully');
      setShowAddModal(false);
      setSelectedLearners([]);
      loadData();
    } catch (error) {
      console.error('Error enrolling learners:', error);
      alert('Failed to enroll learners');
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!confirm('Remove this enrollment?')) return;

    try {
      await enrollmentService.deleteEnrollment(enrollmentId);
      setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
    } catch (error) {
      console.error('Error removing enrollment:', error);
      alert('Failed to remove enrollment');
    }
  };

  const enrolledUserIds = new Set(enrollments.map(e => e.user_id));
  const availableLearners = learners.filter(l => !enrolledUserIds.has(l.id));
  const filteredLearners = availableLearners.filter(l =>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Enrollments</h1>
            <p className="text-gray-600 mt-1">Manage learner assignments</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Enroll Learners</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Enrolled Learners ({enrollments.length})
          </h2>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No enrollments yet</p>
            <p className="text-sm">Click "Enroll Learners" to assign this course</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{enrollment.user.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {enrollment.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        enrollment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {enrollment.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{enrollment.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(enrollment.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveEnrollment(enrollment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Enroll Learners</h2>
              <p className="text-gray-600 mt-1">Select learners to assign to this course</p>
            </div>

            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search learners..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {filteredLearners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No available learners found</p>
                </div>
              ) : (
                <div className="space-y-2">
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
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{learner.full_name}</p>
                        <p className="text-sm text-gray-600">{learner.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEnrollments}
                disabled={selectedLearners.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enroll {selectedLearners.length} Learner{selectedLearners.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
