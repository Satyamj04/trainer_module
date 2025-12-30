import { supabase } from '../lib/supabase';
import { Question } from '../types';

export const quizService = {
  async getQuestions(quizId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order');

    if (error) throw error;
    return data || [];
  },

  async createQuestion(question: Partial<Question>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void> {
    const updates = questionIds.map((id, index) => ({
      id,
      order: index
    }));

    for (const update of updates) {
      await supabase
        .from('questions')
        .update({ order: update.order })
        .eq('id', update.id);
    }
  }
};
