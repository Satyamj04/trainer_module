import { supabase } from '../lib/supabase';
import { Enrollment } from '../types';

export const enrollmentService = {
  async getEnrollments(courseId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        user:profiles!enrollments_user_id_fkey(id, full_name, email)
      `)
      .eq('course_id', courseId)
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createEnrollment(courseId: string, userId: string): Promise<Enrollment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        course_id: courseId,
        user_id: userId,
        assigned_by: user.id,
        status: 'assigned'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bulkCreateEnrollments(courseId: string, userIds: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const enrollments = userIds.map(userId => ({
      course_id: courseId,
      user_id: userId,
      assigned_by: user.id,
      status: 'assigned'
    }));

    const { error } = await supabase
      .from('enrollments')
      .insert(enrollments);

    if (error) throw error;
  },

  async deleteEnrollment(id: string): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getLearners(): Promise<any[]> {
    // Some environments use `role` while others use `primary_role` / `trainee` naming.
    // Try both selectors: prefer primary_role='trainee', fallback to role='learner'.
    let { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('primary_role', 'trainee');

    if (error) throw error;
    if (data && data.length > 0) return data;

    // fallback
    ({ data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('role', 'learner'));

    if (error) throw error;
    return data || [];
  }
};
