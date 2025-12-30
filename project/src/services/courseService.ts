import { supabase } from '../lib/supabase';
import { Course, DashboardStats } from '../types';
import { unitService } from './unitService';
import { enrollmentService } from './enrollmentService';

async function supabaseCreateCourse(course: Partial<Course>) {
  const { data, error } = await supabase
    .from('courses')
    .insert({ ...course, created_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    // Detect common RLS / permission errors and raise a friendly message with guidance
    const errMsg = (error?.message || '').toLowerCase();
    if (errMsg.includes('row-level security') || errMsg.includes('permission') || errMsg.includes('not authorized')) {
      throw new Error('Supabase blocked the insert due to Row-Level Security or permissions. Ensure you are signed in as a trainer or set a DRF trainer token in localStorage (run `python project/scripts/create_token_sql.py trainer_user@example.com` to get a token, then run `localStorage.setItem("trainerToken", "<token>")` in the browser console).');
    }

    throw error;
  }
  return data;
}

export const courseService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const token = localStorage.getItem('trainerToken') || '';
    if (!token) {
      console.warn('No DRF token; returning empty dashboard stats');
      return { totalCourses: 0, activeLearners: 0, completionRate: 0, totalEnrollments: 0 };
    }

    try {
      const resp = await fetch('/api/trainer/v1/dashboard/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      if (resp.ok) return await resp.json();
      console.warn('Dashboard API failed:', resp.status);
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    }

    // Fallback: return empty stats
    return { totalCourses: 0, activeLearners: 0, completionRate: 0, totalEnrollments: 0 };
  },

  async getCourses(): Promise<Course[]> {
    const token = localStorage.getItem('trainerToken') || '';
    if (!token) {
      console.warn('No DRF token; returning empty courses list');
      return [];
    }

    try {
      const resp = await fetch('/api/trainer/v1/course/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        return Array.isArray(data) ? data : (data.results || []);
      }
      console.warn('Get courses API failed:', resp.status);
    } catch (e) {
      console.warn('Get courses fetch error:', e);
    }

    return [];
  },

  async getCourse(id: string): Promise<Course> {
    // Prefer backend course for canonical source
    try {
      return await this.getCourseBackend(id);
    } catch (err) {
      // fallback to Supabase (legacy)
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Course not found');
      return data;
    }
  },

  async getCourseBackend(id: string): Promise<Course> {
    const token = localStorage.getItem('trainerToken') || '';
    const resp = await fetch(`/api/trainer/v1/course/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {})
      }
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Backend get course failed: ${resp.status} ${text}`);
    }
    const data = await resp.json();

    // Attach units if backend didn't include them (or returned a minimal representation)
    if (!data.units || data.units.length === 0) {
      try {
        const units = await unitService.getUnitsBackend(id).catch(() => []);
        data.units = units;
      } catch (e) {
        // best effort; ignore
      }
    }

    return data;
  },

  async getAssignableLearners(courseId: string): Promise<any[]> {
    const token = localStorage.getItem('trainerToken') || '';
    try {
      const resp = await fetch(`/api/trainer/v1/course/${courseId}/assignable_learners/`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Token ${token}` } : {}) }
      });
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn('Trainer assignable learners endpoint failed', e);
    }

    // Fallback to Supabase learners
    return await enrollmentService.getLearners();
  },

  async createCourse(course: Partial<Course>): Promise<Course> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...course,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create course via the backend Django API (trainer endpoints)
  async createCourseBackend(course: Partial<Course>): Promise<Course> {
    // Only send fields the backend Course serializer expects to avoid validation errors
    const payload: any = {
      title: course.title,
      description: course.description,
      status: course.status,
      thumbnail_url: (course as any).thumbnail_url || ''
    };

    const token = localStorage.getItem('trainerToken') || '';
    const resp = await fetch('/api/trainer/v1/course/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      return await resp.json();
    }

    // If backend trainer endpoint isn't available or auth missing, fallback to Supabase
    const status = resp.status;
    const text = await resp.text().catch(() => '');

    if (status === 404 || status === 401 || status === 403) {
      // Try creating using Supabase so the UI can continue to function
      try {
        const created = await supabaseCreateCourse({
          title: course.title,
          description: course.description,
          status: course.status,
          thumbnail_url: (course as any).thumbnail_url || ''
        });
        // warn the caller that backend endpoint was unavailable
        console.warn('Backend trainer API unavailable; created course in Supabase instead', status, text);
        return created as Course;
      } catch (err: any) {
        // If Supabase fails due to RLS / permissions, surface a clearer error
        if ((err?.message || '').toLowerCase().includes('row-level security') || (err?.message || '').toLowerCase().includes('permission')) {
          throw new Error('Could not create course: Supabase blocked the insert due to Row-Level Security or permissions. Please sign in as a trainer or set a DRF trainer token in localStorage (see `python project/scripts/create_token_sql.py trainer_user@example.com` and then `localStorage.setItem("trainerToken", "<token>")`).');
        }
        throw err;
      }
    }

    throw new Error(`Backend create failed: ${status} ${text}`);
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Trainer-only convenience: duplicate a course using the backend's trainer endpoint.
  // This will attempt to send a DRF token stored under `trainerToken` in localStorage.
  async duplicateCourse(id: string): Promise<any> {
    const token = localStorage.getItem('trainerToken') || '';
    const resp = await fetch(`/api/trainer/v1/course/${id}/duplicate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {})
      }
    });
    if (resp.ok) return await resp.json();

    // Fallback: try to duplicate client-side via Supabase (shallow duplicate of course + units)
    const status = resp.status;
    const text = await resp.text().catch(() => '');
    if (status === 404 || status === 401 || status === 403) {
      console.warn('Backend duplicate endpoint unavailable; performing client-side duplicate', status, text);
      // fetch source course (backend preferred)
      const source = await this.getCourse(id).catch(() => null as any);
      if (!source) throw new Error('Source course not found for duplication');
      // create shallow duplicate in Supabase
      const dup = await supabaseCreateCourse({
        title: `${source.title} (copy)`,
        description: source.description || null,
        status: 'draft',
        thumbnail_url: (source as any).thumbnail_url || ''
      });
      // attempt to duplicate units via Supabase (best-effort)
      try {
        const units = await unitService.getUnits(source.id).catch(() => []);
        for (const u of units) {
          await unitService.createUnit({
            ...u,
            course_id: dup.id,
            order: (u as any).order ?? (u as any).sequence_order ?? 0
          }).catch((err) => {
            // If Supabase insertion blocked by RLS, surface an actionable error to the caller
            const msg = (err?.message || '').toLowerCase();
            if (msg.includes('row-level security') || msg.includes('permission')) {
              throw new Error('Could not duplicate course: creating units in Supabase was blocked by Row-Level Security. Set a DRF trainer token in localStorage or enable appropriate RLS permissions.');
            }
            return null;
          });
        }
      } catch (e) {
        if ((e?.message || '').toLowerCase().includes('row-level security')) throw e as Error;
        /* ignore other unit copy failures */
      }
      return dup;
    }

    const errText = `Duplicate failed: ${status} ${text}`;
    throw new Error(errText);
  }
};
