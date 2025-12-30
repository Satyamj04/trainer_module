import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { leaderboardService } from '../services/leaderboardService';
import { Course } from '../types';
import { Trophy, Medal, Award, Filter } from 'lucide-react';

export function Leaderboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCourse]);

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

  const loadLeaderboard = async () => {
    try {
      const courseId = selectedCourse === 'all' ? undefined : selectedCourse;
      const data = await leaderboardService.getLeaderboard(courseId);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
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
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-1">Track top performing learners</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <label className="block text-sm font-medium text-gray-700">
            Filter by Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No leaderboard data yet</p>
            <p className="text-sm">Leaderboard will appear once learners start completing courses</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  index < 3
                    ? 'bg-gradient-to-r from-gray-50 to-white shadow-md'
                    : 'bg-gray-50 border-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${getRankBadgeColor(entry.rank)}`}>
                  {getRankIcon(entry.rank) || entry.rank}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{entry.user?.full_name}</p>
                    {entry.rank <= 3 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                        Top {entry.rank}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{entry.user?.email}</p>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{entry.total_points}</p>
                    <p className="text-xs text-gray-600">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{entry.completed_units}</p>
                    <p className="text-xs text-gray-600">Units</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{entry.quiz_score_total}</p>
                    <p className="text-xs text-gray-600">Quiz Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">How Points are Calculated</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>10 points per completed unit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Quiz scores are added directly to total points</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Activity points are earned for engagement</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
