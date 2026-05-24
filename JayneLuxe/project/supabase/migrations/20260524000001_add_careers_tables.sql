-- Job openings managed by admin
CREATE TABLE IF NOT EXISTS job_openings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text,
  location text,
  type text DEFAULT 'Full-time',
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Job applications submitted by candidates
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  position text NOT NULL,
  job_opening_id uuid REFERENCES job_openings(id) ON DELETE SET NULL,
  cover_letter text,
  resume_url text NOT NULL,
  years_experience integer,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active job_openings" ON job_openings;
DROP POLICY IF EXISTS "Admin all job_openings" ON job_openings;
DROP POLICY IF EXISTS "Anon insert job_applications" ON job_applications;
DROP POLICY IF EXISTS "Admin view job_applications" ON job_applications;
DROP POLICY IF EXISTS "Admin update job_applications" ON job_applications;
DROP POLICY IF EXISTS "Admin delete job_applications" ON job_applications;

CREATE POLICY "Public read active job_openings" ON job_openings FOR SELECT USING (is_active = true);
CREATE POLICY "Admin all job_openings" ON job_openings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Anon insert job_applications" ON job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view job_applications" ON job_applications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update job_applications" ON job_applications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete job_applications" ON job_applications FOR DELETE USING (auth.role() = 'authenticated');

-- Resumes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  5242880,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anon can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Auth can read resumes" ON storage.objects;
DROP POLICY IF EXISTS "Auth can delete resumes" ON storage.objects;

CREATE POLICY "Anon can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Auth can read resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');
CREATE POLICY "Auth can delete resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');
