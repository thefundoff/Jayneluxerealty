/*
  # Prospect Engagement & Lead Capture System

  1. New Tables
    - `prospect_form_fields`  — dynamic form definition (admin-managed questions)
    - `prospect_submissions`  — prospect responses (denormalized name/phone/email + full answers jsonb)
    - `prospect_reviews`      — customer reviews/feedback (moderated)
    - `prospect_social_links` — editable social media URLs, one row per platform
    - `prospect_settings`     — global key/value toggles (e.g. reviews_public)

  2. Security (matches existing careers pattern)
    - RLS enabled on all tables
    - Public read of enabled form fields, approved reviews, social links, settings
    - Anonymous insert on submissions and reviews
    - Authenticated (admin) full control on everything

  3. Seed data
    - Default "Property Interest Form" (editable later via Form Builder)
    - 7 social platforms with empty URLs
    - reviews_public = true
*/

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Dynamic form definition: each row is one admin-configured question
CREATE TABLE IF NOT EXISTS prospect_form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'short_text'
    CHECK (field_type IN (
      'short_text', 'long_text', 'email', 'phone', 'number',
      'dropdown', 'radio', 'checkbox', 'date'
    )),
  field_role text
    CHECK (field_role IN ('name', 'email', 'phone')),
  options jsonb DEFAULT '[]'::jsonb,
  placeholder text,
  is_required boolean DEFAULT false,
  is_enabled boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Prospect submissions: full answers in jsonb, key fields denormalized for the
-- admin responses table (search/filter/CSV)
CREATE TABLE IF NOT EXISTS prospect_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  phone text,
  email text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Customer reviews / feedback (moderated before public display)
CREATE TABLE IF NOT EXISTS prospect_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  review text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Social media links, one row per platform
CREATE TABLE IF NOT EXISTS prospect_social_links (
  platform text PRIMARY KEY,
  url text DEFAULT '',
  is_enabled boolean DEFAULT true,
  sort_order integer DEFAULT 0
);

-- Global key/value settings for the prospect system
CREATE TABLE IF NOT EXISTS prospect_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'null'::jsonb
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE prospect_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_settings ENABLE ROW LEVEL SECURITY;

-- form_fields: public reads enabled fields; admin full control
DROP POLICY IF EXISTS "Public read enabled prospect_form_fields" ON prospect_form_fields;
DROP POLICY IF EXISTS "Admin all prospect_form_fields" ON prospect_form_fields;
CREATE POLICY "Public read enabled prospect_form_fields" ON prospect_form_fields FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admin all prospect_form_fields" ON prospect_form_fields FOR ALL USING (auth.role() = 'authenticated');

-- submissions: anyone can submit; admin can view/delete
DROP POLICY IF EXISTS "Anon insert prospect_submissions" ON prospect_submissions;
DROP POLICY IF EXISTS "Admin view prospect_submissions" ON prospect_submissions;
DROP POLICY IF EXISTS "Admin delete prospect_submissions" ON prospect_submissions;
CREATE POLICY "Anon insert prospect_submissions" ON prospect_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view prospect_submissions" ON prospect_submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete prospect_submissions" ON prospect_submissions FOR DELETE USING (auth.role() = 'authenticated');

-- reviews: anyone can submit; public reads approved; admin full control
DROP POLICY IF EXISTS "Anon insert prospect_reviews" ON prospect_reviews;
DROP POLICY IF EXISTS "Public read approved prospect_reviews" ON prospect_reviews;
DROP POLICY IF EXISTS "Admin all prospect_reviews" ON prospect_reviews;
CREATE POLICY "Anon insert prospect_reviews" ON prospect_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read approved prospect_reviews" ON prospect_reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Admin all prospect_reviews" ON prospect_reviews FOR ALL USING (auth.role() = 'authenticated');

-- social_links: public read; admin full control
DROP POLICY IF EXISTS "Public read prospect_social_links" ON prospect_social_links;
DROP POLICY IF EXISTS "Admin all prospect_social_links" ON prospect_social_links;
CREATE POLICY "Public read prospect_social_links" ON prospect_social_links FOR SELECT USING (true);
CREATE POLICY "Admin all prospect_social_links" ON prospect_social_links FOR ALL USING (auth.role() = 'authenticated');

-- settings: public read; admin full control
DROP POLICY IF EXISTS "Public read prospect_settings" ON prospect_settings;
DROP POLICY IF EXISTS "Admin all prospect_settings" ON prospect_settings;
CREATE POLICY "Public read prospect_settings" ON prospect_settings FOR SELECT USING (true);
CREATE POLICY "Admin all prospect_settings" ON prospect_settings FOR ALL USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Seed: default "Property Interest Form" (only if no fields exist yet)
-- ---------------------------------------------------------------------------

INSERT INTO prospect_form_fields (label, field_type, field_role, options, placeholder, is_required, sort_order)
SELECT * FROM (VALUES
  ('Full Name', 'short_text', 'name', '[]'::jsonb, 'Enter your full name', true, 1),
  ('Phone Number', 'phone', 'phone', '[]'::jsonb, 'Enter your phone number', true, 2),
  ('Email Address', 'email', 'email', '[]'::jsonb, 'Enter your email address', true, 3),
  ('Which best describes you?', 'radio', NULL,
    '["Investor","Home Buyer","Realtor/Broker","Developer","Corporate Buyer","Other"]'::jsonb,
    NULL, false, 4),
  ('What type of property are you interested in?', 'radio', NULL,
    '["Land","Residential Property","Commercial Property","Short-Let Investment","Unsure/Exploring Options"]'::jsonb,
    NULL, false, 5),
  ('Which location(s) are you interested in?', 'checkbox', NULL,
    '["Guzape","Maitama","Asokoro","Centenary City","Lugbe","Lokogoma","Lifecamp","Karsan","Aviation Village","Apo","Kuje"]'::jsonb,
    NULL, false, 6),
  ('What is your estimated budget range?', 'dropdown', NULL,
    '["5M-10M","11M-20M","21M-30M","31M-40M","50-100M","100M-200M","200-500M"]'::jsonb,
    NULL, false, 7),
  ('When do you plan to purchase?', 'radio', NULL,
    '["Immediately","Within 3 Months","Within 6 Months","Within 12 Months","Just Exploring"]'::jsonb,
    NULL, false, 8),
  ('What is your primary reason for buying?', 'radio', NULL,
    '["Investment","Personal Residence","Rental Income","Land Banking","Business Use"]'::jsonb,
    NULL, false, 9),
  ('Would you like a free consultation with our team?', 'radio', NULL,
    '["Yes","No"]'::jsonb, NULL, false, 10)
) AS seed(label, field_type, field_role, options, placeholder, is_required, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM prospect_form_fields);

-- ---------------------------------------------------------------------------
-- Seed: social platforms
-- ---------------------------------------------------------------------------

INSERT INTO prospect_social_links (platform, url, is_enabled, sort_order) VALUES
  ('facebook', '', true, 1),
  ('instagram', '', true, 2),
  ('linkedin', '', true, 3),
  ('x', '', true, 4),
  ('tiktok', '', true, 5),
  ('youtube', '', true, 6),
  ('whatsapp', '', true, 7)
ON CONFLICT (platform) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed: settings
-- ---------------------------------------------------------------------------

INSERT INTO prospect_settings (key, value) VALUES
  ('reviews_public', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
