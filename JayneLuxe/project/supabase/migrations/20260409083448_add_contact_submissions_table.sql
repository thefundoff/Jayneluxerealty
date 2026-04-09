/*
  # Create contact submissions table

  1. New Tables
    - `contact_submissions` - Stores contact form submissions

  2. Security
    - Enable RLS
    - Anonymous users can insert
    - Authenticated users can read
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Anyone can submit contact form'
  ) THEN
    CREATE POLICY "Anyone can submit contact form"
      ON contact_submissions FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Only authenticated users can view submissions'
  ) THEN
    CREATE POLICY "Only authenticated users can view submissions"
      ON contact_submissions FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
