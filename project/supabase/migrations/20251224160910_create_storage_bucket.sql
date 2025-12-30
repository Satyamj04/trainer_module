/*
  # Create Storage Bucket for Media Files

  ## Overview
  Creates a storage bucket for all course media files (videos, audio, presentations, SCORM packages, etc.)
  with appropriate security policies.

  ## Changes
  1. Storage
    - Create 'course-media' bucket for all course files
    - Enable public access for published course content
    - Set up RLS policies for upload/delete operations

  ## Security
  - Trainers can upload files to their own folders
  - Public read access for all users
  - Only file owners can delete their files
*/

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-media',
  'course-media',
  true,
  524288000,
  ARRAY[
    'video/mp4', 'video/webm', 'video/ogg',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
    'application/pdf',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'course-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'course-media');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'course-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'course-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'course-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
