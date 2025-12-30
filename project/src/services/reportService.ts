import { supabase } from '../lib/supabase';

export interface CourseReport {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  inProgress: number;
  completed: number;
  averageProgress: number;
  averageScore: number;
}

export interface LearnerReport {
  userId: string;
  userName: string;
  email: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  averageProgress: number;
  totalQuizScore: number;
  lastActivity: string;
}

export const reportService = {
  async getCourseReport(courseId: string): Promise<CourseReport> {
    const { data: course } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId);

    const totalEnrollments = enrollments?.length || 0;
    const inProgress = enrollments?.filter(e => e.status === 'in_progress').length || 0;
    const completed = enrollments?.filter(e => e.status === 'completed').length || 0;
    const averageProgress = totalEnrollments > 0
      ? enrollments!.reduce((sum, e) => sum + e.progress_percentage, 0) / totalEnrollments
      : 0;

    const { data: units } = await supabase
      .from('units')
      .select('id')
      .eq('course_id', courseId)
      .eq('type', 'quiz');

    const quizUnitIds = units?.map(u => u.id) || [];
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id')
      .in('unit_id', quizUnitIds);

    const quizIds = quizzes?.map(q => q.id) || [];
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score')
      .in('quiz_id', quizIds);

    const averageScore = attempts?.length
      ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
      : 0;

    return {
      courseId: course?.id || '',
      courseTitle: course?.title || '',
      totalEnrollments,
      inProgress,
      completed,
      averageProgress: Math.round(averageProgress),
      averageScore: Math.round(averageScore)
    };
  },

  async getLearnerReport(userId: string): Promise<LearnerReport> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId);

    const coursesEnrolled = enrollments?.length || 0;
    const coursesCompleted = enrollments?.filter(e => e.status === 'completed').length || 0;
    const averageProgress = coursesEnrolled > 0
      ? enrollments!.reduce((sum, e) => sum + e.progress_percentage, 0) / coursesEnrolled
      : 0;

    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score')
      .eq('user_id', userId);

    const totalQuizScore = attempts?.reduce((sum, a) => sum + a.score, 0) || 0;

    const lastActivity = enrollments?.sort((a, b) =>
      new Date(b.started_at || b.assigned_at).getTime() -
      new Date(a.started_at || a.assigned_at).getTime()
    )[0]?.started_at || enrollments?.[0]?.assigned_at || '';

    return {
      userId: profile?.id || '',
      userName: profile?.full_name || '',
      email: profile?.email || '',
      coursesEnrolled,
      coursesCompleted,
      averageProgress: Math.round(averageProgress),
      totalQuizScore,
      lastActivity
    };
  },

  async exportCourseReportCSV(courseId: string): Promise<string> {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        *,
        user:profiles!enrollments_user_id_fkey(full_name, email)
      `)
      .eq('course_id', courseId);

    const headers = ['User Name', 'Email', 'Status', 'Progress %', 'Assigned Date', 'Completed Date'];
    const rows = enrollments?.map(e => [
      e.user.full_name,
      e.user.email,
      e.status,
      e.progress_percentage,
      new Date(e.assigned_at).toLocaleDateString(),
      e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '-'
    ]) || [];

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csv;
  }
};
