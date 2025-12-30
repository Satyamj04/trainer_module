import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { leaderboardService } from '../services/leaderboardService';
import { DashboardStats, LeaderboardEntry } from '../types';
import { BookOpen, Users, TrendingUp, Plus, FileText, Trophy, UserPlus } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    activeLearners: 0,
    completionRate: 0,
    totalEnrollments: 0
  });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const statsData = await courseService.getDashboardStats();
      const leaderboardData = await leaderboardService.getLeaderboard().catch(() => []);
      setStats(statsData);
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData.slice(0, 5) : []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setStats({ totalCourses: 0, activeLearners: 0, completionRate: 0, totalEnrollments: 0 });
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Learners',
      value: stats.activeLearners,
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-4 rounded-xl`}>
                <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('create-course')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create New Course</span>
            </button>
            <button
              onClick={() => onNavigate('assign-course')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Assign Courses</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">View Reports</span>
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Trophy className="w-5 h-5" />
              <span className="font-medium">View Leaderboard</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No leaderboard data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{entry.user?.full_name}</p>
                    <p className="text-sm text-gray-500">{entry.total_points} points</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{entry.completed_units} units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
