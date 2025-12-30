/*
  # Fix Profiles Insert Policy

  ## Changes
  - Add INSERT policy for profiles table to allow users to create their own profile during signup
  
  ## Security
  - Users can only insert a profile with their own auth.uid()
*/

-- Add INSERT policy for profiles
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
