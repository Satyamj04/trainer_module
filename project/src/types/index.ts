export interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  language: string;
  thumbnail_url?: string;
  status: 'draft' | 'published';
  visibility: 'private' | 'public' | 'restricted';
  sequential_access: boolean;
  completion_rule: 'all_units' | 'required_units';
  certificate_enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type UnitType = 'text' | 'video' | 'audio' | 'presentation' | 'scorm' | 'xapi' | 'quiz' | 'test' | 'assignment' | 'survey' | 'page';

export interface Unit {
  id: string;
  course_id: string;
  type: UnitType;
  title: string;
  order: number;
  is_required: boolean;
  created_at: string;
}

export interface VideoUnit {
  id: string;
  unit_id: string;
  video_url?: string;
  video_storage_path?: string;
  duration: number;
  completion_type: 'full' | 'percentage';
  required_watch_percentage: number;
  allow_skip: boolean;
  allow_rewind: boolean;
}

export interface AudioUnit {
  id: string;
  unit_id: string;
  audio_url?: string;
  audio_storage_path?: string;
  duration: number;
}

export interface PresentationUnit {
  id: string;
  unit_id: string;
  file_url?: string;
  file_storage_path?: string;
  slide_count: number;
}

export interface TextUnit {
  id: string;
  unit_id: string;
  content?: string;
}

export interface PageUnit {
  id: string;
  unit_id: string;
  content: any[];
  version: number;
}

export type QuestionType = 'multiple_choice' | 'multiple_answer' | 'true_false' | 'fill_blank' | 'matching' | 'ordering' | 'free_text';

export interface Quiz {
  id: string;
  unit_id: string;
  time_limit?: number;
  passing_score: number;
  attempts_allowed: number;
  show_answers: boolean;
  randomize_questions: boolean;
  mandatory_completion: boolean;
}

export interface Question {
  id: string;
  quiz_id: string;
  type: QuestionType;
  text: string;
  options: any[];
  correct_answer: any;
  points: number;
  order: number;
}

export interface Assignment {
  id: string;
  unit_id: string;
  submission_type: 'file' | 'text' | 'both';
  due_date?: string;
  max_score: number;
  instructions?: string;
}

export interface ScormPackage {
  id: string;
  unit_id: string;
  package_type: 'scorm_1_2' | 'scorm_2004' | 'xapi';
  file_url?: string;
  file_storage_path?: string;
  version?: string;
  completion_tracking: boolean;
  score_tracking: boolean;
}

export interface Survey {
  id: string;
  unit_id: string;
  questions: any[];
  allow_anonymous: boolean;
}

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  assigned_by?: string;
  status: 'assigned' | 'in_progress' | 'completed';
  progress_percentage: number;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface UnitProgress {
  id: string;
  enrollment_id: string;
  unit_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  watch_percentage: number;
  score?: number;
  started_at?: string;
  completed_at?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_type?: string;
  submission_text?: string;
  submission_file_url?: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'graded';
  submitted_at: string;
  graded_at?: string;
  graded_by?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  answers: any;
  started_at: string;
  completed_at?: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  course_id?: string;
  total_points: number;
  completed_units: number;
  quiz_score_total: number;
  activity_points: number;
  rank: number;
  updated_at: string;
}

export interface MediaMetadata {
  id: string;
  storage_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  duration?: number;
  width?: number;
  height?: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface DashboardStats {
  totalCourses: number;
  activeLearners: number;
  completionRate: number;
  totalEnrollments: number;
}
