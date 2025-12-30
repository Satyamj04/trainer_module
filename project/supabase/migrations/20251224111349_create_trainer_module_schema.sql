/*
  # Trainer Module Complete Database Schema

  ## Overview
  Complete LMS Trainer Module database with all tables for course management,
  content creation, assessments, SCORM/xAPI, enrollment, and leaderboard.

  ## New Tables

  ### 1. profiles
  Extended user profile with role management
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text: 'trainer' | 'learner')
  - `avatar_url` (text)
  - `created_at` (timestamptz)

  ### 2. courses
  Main course entity with all configuration options
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `category` (text)
  - `language` (text)
  - `thumbnail_url` (text)
  - `status` (text: 'draft' | 'published')
  - `visibility` (text: 'private' | 'public' | 'restricted')
  - `sequential_access` (boolean)
  - `completion_rule` (text: 'all_units' | 'required_units')
  - `certificate_enabled` (boolean)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. units
  Course units with type and ordering
  - `id` (uuid, primary key)
  - `course_id` (uuid, references courses)
  - `type` (text: 'text' | 'video' | 'audio' | 'presentation' | 'scorm' | 'xapi' | 'quiz' | 'test' | 'assignment' | 'survey' | 'page')
  - `title` (text)
  - `order` (integer)
  - `is_required` (boolean)
  - `created_at` (timestamptz)

  ### 4. video_units
  Video-specific settings
  - `id` (uuid, primary key)
  - `unit_id` (uuid, references units)
  - `video_url` (text)
  - `video_storage_path` (text)
  - `duration` (integer, seconds)
  - `completion_type` (text: 'full' | 'percentage')
  - `required_watch_percentage` (integer)
  - `allow_skip` (boolean)
  - `allow_rewind` (boolean)

  ### 5. audio_units
  Audio-specific settings
  - `id` (uuid, primary key)
  - `unit_id` (uuid, references units)
  - `audio_url` (text)
  - `audio_storage_path` (text)
  - `duration` (integer)

  ### 6. presentation_units
  Presentation/slides settings
  - `id` (uuid, primary key)
  - `unit_id` (uuid, references units)
  - `file_url` (text)
  - `file_storage_path` (text)
  - `slide_count` (integer)

  ### 7. text_units
  Text content units
  - `id` (uuid, primary key)
  - `unit_id` (uuid, references units)
  - `content` (text)

  ### 8. page_units
  TalentCraft-style authored pages
  - `id` (uuid, primary key)
  - `unit_id` (uuid, references units)
  - `content` (jsonb)
  - `version` (integer)

  ### 9. quizzes
  Quiz/Test configuration
  - `id` (uuid, primary key)
  - `unit_id` (uuid, references units)
  - `time_limit` (integer, minutes)
  - `passing_score` (integer, percentage)
  - `attempts_allowed` (integer)
  - `show_answers` (boolean)
  - `randomize_questions` (boolean)
  - `mandatory_completion` (boolean)

  ### 10. questions
  Quiz questions
  - `id` (uuid, primary key)
  - `quiz_id` (uuid, references quizzes)
  - `type` (text: 'multiple_choice' | 'multiple_answer' | 'true_false' | 'fill_blank' | 'matching' | 'ordering' | 'free_text')
  - `text` (text)
  - `options` (jsonb)
  - `correct_answer` (jsonb)
  - `points` (integer)
  - `order` (integer)

  ### 11. assignments
  Assignment configuration
  - `id` (uuid, primary key)
  - `unit_id` (uuid, references units)
  - `submission_type` (text: 'file' | 'text' | 'both')
  - `due_date` (timestamptz)
  - `max_score` (integer)
  - `instructions` (text)

  ### 12. scorm_packages
  SCORM/xAPI packages
  - `id` (uuid, primary key)
  - `unit_id` (uuid, references units)
  - `package_type` (text: 'scorm_1_2' | 'scorm_2004' | 'xapi')
  - `file_url` (text)
  - `file_storage_path` (text)
  - `version` (text)
  - `completion_tracking` (boolean)
  - `score_tracking` (boolean)

  ### 13. surveys
  Survey configuration
  - `id` (uuid, primary key)
  - `unit_id` (uuid, references units)
  - `questions` (jsonb)
  - `allow_anonymous` (boolean)

  ### 14. enrollments
  Course enrollments
  - `id` (uuid, primary key)
  - `course_id` (uuid, references courses)
  - `user_id` (uuid, references profiles)
  - `assigned_by` (uuid, references profiles)
  - `status` (text: 'assigned' | 'in_progress' | 'completed')
  - `progress_percentage` (integer)
  - `assigned_at` (timestamptz)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 15. unit_progress
  Individual unit completion tracking
  - `id` (uuid, primary key)
  - `enrollment_id` (uuid, references enrollments)
  - `unit_id` (uuid, references units)
  - `status` (text: 'not_started' | 'in_progress' | 'completed')
  - `watch_percentage` (integer)
  - `score` (integer)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 16. assignment_submissions
  Assignment submissions and grading
  - `id` (uuid, primary key)
  - `assignment_id` (uuid, references assignments)
  - `user_id` (uuid, references profiles)
  - `submission_type` (text)
  - `submission_text` (text)
  - `submission_file_url` (text)
  - `score` (integer)
  - `feedback` (text)
  - `status` (text: 'pending' | 'graded')
  - `submitted_at` (timestamptz)
  - `graded_at` (timestamptz)
  - `graded_by` (uuid, references profiles)

  ### 17. quiz_attempts
  Quiz attempt tracking
  - `id` (uuid, primary key)
  - `quiz_id` (uuid, references quizzes)
  - `user_id` (uuid, references profiles)
  - `score` (integer)
  - `passed` (boolean)
  - `answers` (jsonb)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 18. leaderboard
  Leaderboard rankings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `course_id` (uuid, references courses, nullable)
  - `total_points` (integer)
  - `completed_units` (integer)
  - `quiz_score_total` (integer)
  - `activity_points` (integer)
  - `rank` (integer)
  - `updated_at` (timestamptz)

  ### 19. media_metadata
  S3 storage metadata for all media files
  - `id` (uuid, primary key)
  - `storage_path` (text)
  - `file_name` (text)
  - `file_type` (text)
  - `file_size` (bigint)
  - `mime_type` (text)
  - `duration` (integer, for video/audio)
  - `width` (integer, for images/video)
  - `height` (integer, for images/video)
  - `uploaded_by` (uuid, references profiles)
  - `uploaded_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Trainers can manage their own courses
  - Learners can view assigned courses only
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'learner' CHECK (role IN ('trainer', 'learner')),
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  language text DEFAULT 'English',
  thumbnail_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  visibility text DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'restricted')),
  sequential_access boolean DEFAULT false,
  completion_rule text DEFAULT 'all_units' CHECK (completion_rule IN ('all_units', 'required_units')),
  certificate_enabled boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('text', 'video', 'audio', 'presentation', 'scorm', 'xapi', 'quiz', 'test', 'assignment', 'survey', 'page')),
  title text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create video_units table
CREATE TABLE IF NOT EXISTS video_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid UNIQUE REFERENCES units(id) ON DELETE CASCADE,
  video_url text,
  video_storage_path text,
  duration integer DEFAULT 0,
  completion_type text DEFAULT 'full' CHECK (completion_type IN ('full', 'percentage')),
  required_watch_percentage integer DEFAULT 100,
  allow_skip boolean DEFAULT false,
  allow_rewind boolean DEFAULT true
);

-- Create audio_units table
CREATE TABLE IF NOT EXISTS audio_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid UNIQUE REFERENCES units(id) ON DELETE CASCADE,
  audio_url text,
  audio_storage_path text,
  duration integer DEFAULT 0
);

-- Create presentation_units table
CREATE TABLE IF NOT EXISTS presentation_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid UNIQUE REFERENCES units(id) ON DELETE CASCADE,
  file_url text,
  file_storage_path text,
  slide_count integer DEFAULT 0
);

-- Create text_units table
CREATE TABLE IF NOT EXISTS text_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid UNIQUE REFERENCES units(id) ON DELETE CASCADE,
  content text
);

-- Create page_units table
CREATE TABLE IF NOT EXISTS page_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid UNIQUE REFERENCES units(id) ON DELETE CASCADE,
  content jsonb DEFAULT '[]'::jsonb,
  version integer DEFAULT 1
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid UNIQUE REFERENCES units(id) ON DELETE CASCADE,
  time_limit integer,
  passing_score integer DEFAULT 70,
  attempts_allowed integer DEFAULT 1,
  show_answers boolean DEFAULT false,
  randomize_questions boolean DEFAULT false,
  mandatory_completion boolean DEFAULT false
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'multiple_answer', 'true_false', 'fill_blank', 'matching', 'ordering', 'free_text')),
  text text NOT NULL,
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer jsonb,
  points integer DEFAULT 1,
  "order" integer DEFAULT 0
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid UNIQUE REFERENCES units(id) ON DELETE CASCADE,
  submission_type text DEFAULT 'both' CHECK (submission_type IN ('file', 'text', 'both')),
  due_date timestamptz,
  max_score integer DEFAULT 100,
  instructions text
);

-- Create scorm_packages table
CREATE TABLE IF NOT EXISTS scorm_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid UNIQUE REFERENCES units(id) ON DELETE CASCADE,
  package_type text CHECK (package_type IN ('scorm_1_2', 'scorm_2004', 'xapi')),
  file_url text,
  file_storage_path text,
  version text,
  completion_tracking boolean DEFAULT true,
  score_tracking boolean DEFAULT true
);

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid UNIQUE REFERENCES units(id) ON DELETE CASCADE,
  questions jsonb DEFAULT '[]'::jsonb,
  allow_anonymous boolean DEFAULT false
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id),
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  progress_percentage integer DEFAULT 0,
  assigned_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(course_id, user_id)
);

-- Create unit_progress table
CREATE TABLE IF NOT EXISTS unit_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES enrollments(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  watch_percentage integer DEFAULT 0,
  score integer,
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(enrollment_id, unit_id)
);

-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  submission_type text,
  submission_text text,
  submission_file_url text,
  score integer,
  feedback text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'graded')),
  submitted_at timestamptz DEFAULT now(),
  graded_at timestamptz,
  graded_by uuid REFERENCES profiles(id)
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  passed boolean DEFAULT false,
  answers jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  completed_units integer DEFAULT 0,
  quiz_score_total integer DEFAULT 0,
  activity_points integer DEFAULT 0,
  rank integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create media_metadata table
CREATE TABLE IF NOT EXISTS media_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text UNIQUE NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  mime_type text,
  duration integer,
  width integer,
  height integer,
  uploaded_by uuid REFERENCES profiles(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorm_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_metadata ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Courses policies
CREATE POLICY "Trainers can view own courses"
  ON courses FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'trainer'
    )
  );

CREATE POLICY "Trainers can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update own courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Trainers can delete own courses"
  ON courses FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Units policies
CREATE POLICY "Trainers can manage units in own courses"
  ON units FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = units.course_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Video units policies
CREATE POLICY "Trainers can manage video units"
  ON video_units FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN courses ON courses.id = units.course_id
      WHERE units.id = video_units.unit_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Audio units policies
CREATE POLICY "Trainers can manage audio units"
  ON audio_units FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN courses ON courses.id = units.course_id
      WHERE units.id = audio_units.unit_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Presentation units policies
CREATE POLICY "Trainers can manage presentation units"
  ON presentation_units FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN courses ON courses.id = units.course_id
      WHERE units.id = presentation_units.unit_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Text units policies
CREATE POLICY "Trainers can manage text units"
  ON text_units FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN courses ON courses.id = units.course_id
      WHERE units.id = text_units.unit_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Page units policies
CREATE POLICY "Trainers can manage page units"
  ON page_units FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN courses ON courses.id = units.course_id
      WHERE units.id = page_units.unit_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Quizzes policies
CREATE POLICY "Trainers can manage quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN courses ON courses.id = units.course_id
      WHERE units.id = quizzes.unit_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Questions policies
CREATE POLICY "Trainers can manage questions"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN units ON units.id = quizzes.unit_id
      JOIN courses ON courses.id = units.course_id
      WHERE quizzes.id = questions.quiz_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Assignments policies
CREATE POLICY "Trainers can manage assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN courses ON courses.id = units.course_id
      WHERE units.id = assignments.unit_id 
      AND courses.created_by = auth.uid()
    )
  );

-- SCORM packages policies
CREATE POLICY "Trainers can manage scorm packages"
  ON scorm_packages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN courses ON courses.id = units.course_id
      WHERE units.id = scorm_packages.unit_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Surveys policies
CREATE POLICY "Trainers can manage surveys"
  ON surveys FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units 
      JOIN courses ON courses.id = units.course_id
      WHERE units.id = surveys.unit_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Enrollments policies
CREATE POLICY "Trainers can manage enrollments for own courses"
  ON enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = enrollments.course_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Unit progress policies
CREATE POLICY "Trainers can view progress for own courses"
  ON unit_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      JOIN courses ON courses.id = enrollments.course_id
      WHERE enrollments.id = unit_progress.enrollment_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Assignment submissions policies
CREATE POLICY "Trainers can view and grade submissions"
  ON assignment_submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN units ON units.id = assignments.unit_id
      JOIN courses ON courses.id = units.course_id
      WHERE assignments.id = assignment_submissions.assignment_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Quiz attempts policies
CREATE POLICY "Trainers can view quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN units ON units.id = quizzes.unit_id
      JOIN courses ON courses.id = units.course_id
      WHERE quizzes.id = quiz_attempts.quiz_id 
      AND courses.created_by = auth.uid()
    )
  );

-- Leaderboard policies
CREATE POLICY "Trainers can view leaderboard"
  ON leaderboard FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = leaderboard.course_id 
      AND courses.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'trainer'
    )
  );

-- Media metadata policies
CREATE POLICY "Trainers can manage own media"
  ON media_metadata FOR ALL
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_units_course_id ON units(course_id);
CREATE INDEX IF NOT EXISTS idx_units_order ON units(course_id, "order");
CREATE INDEX IF NOT EXISTS idx_enrollments_course_user ON enrollments(course_id, user_id);
CREATE INDEX IF NOT EXISTS idx_unit_progress_enrollment ON unit_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_course ON leaderboard(course_id, rank);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id, quiz_id);