import { supabase } from '../lib/supabase';
import { Unit, VideoUnit, AudioUnit, PresentationUnit, TextUnit, PageUnit, Quiz, Assignment, ScormPackage, Survey } from '../types';

export const unitService = {
  async getUnits(courseId: string): Promise<Unit[]> {
    // Prefer backend units (canonical); fall back to Supabase
    try {
      return await this.getUnitsBackend(courseId);
    } catch (err) {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('course_id', courseId)
        .order('order');

      if (error) throw error;
      return data || [];
    }
  },

  async getUnitsBackend(courseId: string): Promise<Unit[]> {
    const token = localStorage.getItem('trainerToken') || '';
    const resp = await fetch(`/api/units/?course_id=${courseId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {})
      }
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Backend get units failed: ${resp.status} ${text}`);
    }
    return await resp.json();
  },

  async createUnitBackend(unit: Partial<Unit>): Promise<Unit> {
    const token = localStorage.getItem('trainerToken') || '';
    // Backend expects course ID and will auto-assign sequence_order
    const payload: any = {
      course: (unit as any).course || (unit as any).course_id,
      module_type: (unit as any).type || unit.module_type,
      title: unit.title || 'Untitled Unit',
      description: unit.description || '',
      is_mandatory: (unit as any).is_required ?? unit.is_mandatory ?? true
      // Note: Don't send sequence_order/order - let backend auto-assign it
    };

    const resp = await fetch('/api/units/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    
    if (!resp.ok) {
      const text = await resp.text().catch(() => 'Unknown error');
      throw new Error(`Failed to create unit: ${resp.status} ${text.substring(0, 200)}`);
    }
    
    return await resp.json();
  },

  async updateUnitBackend(id: string, updates: Partial<Unit>): Promise<Unit> {
    const token = localStorage.getItem('trainerToken') || '';
    const resp = await fetch(`/api/units/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {})
      },
      body: JSON.stringify(updates)
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Update unit failed: ${resp.status} ${text}`);
    }
    return await resp.json();
  },

  async deleteUnitBackend(id: string): Promise<void> {
    const token = localStorage.getItem('trainerToken') || '';
    const resp = await fetch(`/api/units/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {})
      }
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Delete unit failed: ${resp.status} ${text}`);
    }
  },

  async createUnit(unit: Partial<Unit>): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .insert(unit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUnit(id: string, updates: Partial<Unit>): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUnit(id: string): Promise<void> {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorderUnits(courseId: string, unitIds: string[]): Promise<void> {
    const updates = unitIds.map((id, index) => ({
      id,
      order: index
    }));

    for (const update of updates) {
      await supabase
        .from('units')
        .update({ order: update.order })
        .eq('id', update.id);
    }
  },

  async createVideoUnit(videoUnit: Partial<VideoUnit>): Promise<VideoUnit> {
    const { data, error } = await supabase
      .from('video_units')
      .insert(videoUnit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVideoUnit(id: string, updates: Partial<VideoUnit>): Promise<VideoUnit> {
    const { data, error } = await supabase
      .from('video_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getVideoUnit(unitId: string): Promise<VideoUnit | null> {
    const { data, error } = await supabase
      .from('video_units')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createAudioUnit(audioUnit: Partial<AudioUnit>): Promise<AudioUnit> {
    const { data, error } = await supabase
      .from('audio_units')
      .insert(audioUnit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAudioUnit(unitId: string): Promise<AudioUnit | null> {
    const { data, error } = await supabase
      .from('audio_units')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createPresentationUnit(presentationUnit: Partial<PresentationUnit>): Promise<PresentationUnit> {
    const { data, error } = await supabase
      .from('presentation_units')
      .insert(presentationUnit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPresentationUnit(unitId: string): Promise<PresentationUnit | null> {
    const { data, error } = await supabase
      .from('presentation_units')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createTextUnit(textUnit: Partial<TextUnit>): Promise<TextUnit> {
    const { data, error } = await supabase
      .from('text_units')
      .insert(textUnit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTextUnit(id: string, updates: Partial<TextUnit>): Promise<TextUnit> {
    const { data, error } = await supabase
      .from('text_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTextUnit(unitId: string): Promise<TextUnit | null> {
    const { data, error } = await supabase
      .from('text_units')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createPageUnit(pageUnit: Partial<PageUnit>): Promise<PageUnit> {
    const { data, error } = await supabase
      .from('page_units')
      .insert(pageUnit)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePageUnit(id: string, updates: Partial<PageUnit>): Promise<PageUnit> {
    const { data, error } = await supabase
      .from('page_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPageUnit(unitId: string): Promise<PageUnit | null> {
    const { data, error } = await supabase
      .from('page_units')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createQuiz(quiz: Partial<Quiz>): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quiz)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getQuiz(unitId: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createAssignment(assignment: Partial<Assignment>): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAssignment(unitId: string): Promise<Assignment | null> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createScormPackage(scormPackage: Partial<ScormPackage>): Promise<ScormPackage> {
    const { data, error } = await supabase
      .from('scorm_packages')
      .insert(scormPackage)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getScormPackage(unitId: string): Promise<ScormPackage | null> {
    const { data, error } = await supabase
      .from('scorm_packages')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createSurvey(survey: Partial<Survey>): Promise<Survey> {
    const { data, error } = await supabase
      .from('surveys')
      .insert(survey)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSurvey(id: string, updates: Partial<Survey>): Promise<Survey> {
    const { data, error } = await supabase
      .from('surveys')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSurvey(unitId: string): Promise<Survey | null> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('unit_id', unitId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getUnitDetails(unitId: string, type: string): Promise<any> {
    switch (type) {
      case 'video':
        return this.getVideoUnit(unitId);
      case 'audio':
        return this.getAudioUnit(unitId);
      case 'presentation':
        return this.getPresentationUnit(unitId);
      case 'text':
        return this.getTextUnit(unitId);
      case 'page':
        return this.getPageUnit(unitId);
      case 'quiz':
      case 'test':
        return this.getQuiz(unitId);
      case 'assignment':
        return this.getAssignment(unitId);
      case 'scorm':
      case 'xapi':
        return this.getScormPackage(unitId);
      case 'survey':
        return this.getSurvey(unitId);
      default:
        return null;
    }
  },

  async updateUnitContent(unitId: string, type: string, contentData: any): Promise<any> {
    const existing = await this.getUnitDetails(unitId, type);

    if (existing) {
      switch (type) {
        case 'video':
          const { data: videoData, error: videoError } = await supabase
            .from('video_units')
            .update(contentData)
            .eq('unit_id', unitId)
            .select()
            .single();
          if (videoError) throw videoError;
          return videoData;

        case 'audio':
          const { data: audioData, error: audioError } = await supabase
            .from('audio_units')
            .update(contentData)
            .eq('unit_id', unitId)
            .select()
            .single();
          if (audioError) throw audioError;
          return audioData;

        case 'presentation':
          const { data: presData, error: presError } = await supabase
            .from('presentation_units')
            .update(contentData)
            .eq('unit_id', unitId)
            .select()
            .single();
          if (presError) throw presError;
          return presData;

        case 'text':
          const { data: textData, error: textError } = await supabase
            .from('text_units')
            .update(contentData)
            .eq('unit_id', unitId)
            .select()
            .single();
          if (textError) throw textError;
          return textData;

        case 'page':
          const { data: pageData, error: pageError } = await supabase
            .from('page_units')
            .update(contentData)
            .eq('unit_id', unitId)
            .select()
            .single();
          if (pageError) throw pageError;
          return pageData;

        case 'quiz':
        case 'test':
          const { data: quizData, error: quizError } = await supabase
            .from('quizzes')
            .update(contentData)
            .eq('unit_id', unitId)
            .select()
            .single();
          if (quizError) throw quizError;
          return quizData;

        case 'assignment':
          const { data: assignData, error: assignError } = await supabase
            .from('assignments')
            .update(contentData)
            .eq('unit_id', unitId)
            .select()
            .single();
          if (assignError) throw assignError;
          return assignData;

        case 'scorm':
        case 'xapi':
          const { data: scormData, error: scormError } = await supabase
            .from('scorm_packages')
            .update(contentData)
            .eq('unit_id', unitId)
            .select()
            .single();
          if (scormError) throw scormError;
          return scormData;

        case 'survey':
          const { data: surveyData, error: surveyError } = await supabase
            .from('surveys')
            .update(contentData)
            .eq('unit_id', unitId)
            .select()
            .single();
          if (surveyError) throw surveyError;
          return surveyData;
      }
    } else {
      switch (type) {
        case 'video':
          return this.createVideoUnit({ unit_id: unitId, ...contentData });
        case 'audio':
          return this.createAudioUnit({ unit_id: unitId, ...contentData });
        case 'presentation':
          return this.createPresentationUnit({ unit_id: unitId, ...contentData });
        case 'text':
          return this.createTextUnit({ unit_id: unitId, ...contentData });
        case 'page':
          return this.createPageUnit({ unit_id: unitId, ...contentData });
        case 'quiz':
        case 'test':
          return this.createQuiz({ unit_id: unitId, ...contentData });
        case 'assignment':
          return this.createAssignment({ unit_id: unitId, ...contentData });
        case 'scorm':
        case 'xapi':
          return this.createScormPackage({ unit_id: unitId, ...contentData });
        case 'survey':
          return this.createSurvey({ unit_id: unitId, ...contentData });
      }
    }
  }
};
