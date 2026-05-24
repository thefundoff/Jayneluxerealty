-- Enhance job_openings with all spec-required fields
ALTER TABLE job_openings
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS salary_range text,
  ADD COLUMN IF NOT EXISTS commission_details text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS full_description text,
  ADD COLUMN IF NOT EXISTS responsibilities text,
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS benefits_list text,
  ADD COLUMN IF NOT EXISTS accept_applications boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS application_deadline date,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_supporting_docs boolean DEFAULT true;

-- Migrate existing description to short_description
UPDATE job_openings SET short_description = description WHERE short_description IS NULL AND description IS NOT NULL;

-- Enhance job_applications with new form fields
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS cover_letter_url text,
  ADD COLUMN IF NOT EXISTS supporting_doc_url text,
  ADD COLUMN IF NOT EXISTS consent_given boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS internal_notes text;

-- General (unsolicited) applications table
CREATE TABLE IF NOT EXISTS general_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  resume_url text NOT NULL,
  area_of_interest text,
  notes text,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE general_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert general_applications" ON general_applications;
DROP POLICY IF EXISTS "Admin view general_applications" ON general_applications;
DROP POLICY IF EXISTS "Admin update general_applications" ON general_applications;
DROP POLICY IF EXISTS "Admin delete general_applications" ON general_applications;

CREATE POLICY "Anon insert general_applications" ON general_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view general_applications" ON general_applications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update general_applications" ON general_applications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete general_applications" ON general_applications FOR DELETE USING (auth.role() = 'authenticated');
