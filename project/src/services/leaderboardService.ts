import { supabase } from '../lib/supabase';
import { LeaderboardEntry } from '../types';

export const leaderboardService = {
  async getLeaderboard(courseId?: string): Promise<LeaderboardEntry[]> {
    let query = supabase
      .from('leaderboard')
      .select(`
        *,
        user:profiles!leaderboard_user_id_fkey(full_name, email, avatar_url)
      `)
      .order('rank');

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async updateLeaderboard(userId: string, courseId: string): Promise<void> {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (!enrollment) return;

    const { data: progress } = await supabase
      .from('unit_progress')
      .select('*')
      .eq('enrollment_id', enrollment.id);

    const completedUnits = progress?.filter(p => p.status === 'completed').length || 0;

    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score')
      .eq('user_id', userId);

    const quizScoreTotal = attempts?.reduce((sum, a) => sum + a.score, 0) || 0;

    const totalPoints = (completedUnits * 10) + quizScoreTotal;
    const activityPoints = progress?.length || 0;

    const { error } = await supabase
      .from('leaderboard')
      .upsert({
        user_id: userId,
        course_id: courseId,
        total_points: totalPoints,
        completed_units: completedUnits,
        quiz_score_total: quizScoreTotal,
        activity_points: activityPoints,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,course_id'
      });

    if (error) throw error;

    await this.recalculateRanks(courseId);
  },

  async recalculateRanks(courseId: string): Promise<void> {
    const { data: entries } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('course_id', courseId)
      .order('total_points', { ascending: false });

    if (!entries) return;

    for (let i = 0; i < entries.length; i++) {
      await supabase
        .from('leaderboard')
        .update({ rank: i + 1 })
        .eq('id', entries[i].id);
    }
  }
};
