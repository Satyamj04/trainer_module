import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { reportService, CourseReport } from '../services/reportService';
import { Course } from '../types';
import { BarChart3, Download, TrendingUp, Users, CheckCircle } from 'lucide-react';

export function Reports() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [report, setReport] = useState<CourseReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadReport();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const data = await courseService.getCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    try {
      const data = await reportService.getCourseReport(selectedCourse);
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await reportService.exportCourseReportCSV(selectedCourse);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `course-report-${selectedCourse}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export report');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Track course performance and learner progress</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Export CSV</span>
          </button>
        </div>

        {report && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">Total Enrollments</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{report.totalEnrollments}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-900">In Progress</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{report.inProgress}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">Completed</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{report.completed}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">Avg Score</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">{report.averageScore}%</p>
            </div>
          </div>
        )}
      </div>

      {report && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Average Progress</span>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${report.averageProgress}%` }}
                  />
                </div>
                <span className="text-gray-900 font-bold">{report.averageProgress}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Completion Rate</span>
              <span className="text-gray-900 font-bold">
                {report.totalEnrollments > 0
                  ? Math.round((report.completed / report.totalEnrollments) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
