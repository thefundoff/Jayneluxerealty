/*
  # Add Property Variants

  1. New Tables
    - `property_variants` — child table holding (label, square_feet, price) options per property

  2. Security
    - Enable RLS
    - Public SELECT, anon INSERT / UPDATE / DELETE (matches existing admin policy pattern)

  3. Indexes
    - idx_property_variants_property_id — fast JOIN on property_id
*/

CREATE TABLE IF NOT EXISTS property_variants (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label       text        NOT NULL,
  square_feet integer     NOT NULL CHECK (square_feet > 0),
  price       decimal     NOT NULL CHECK (price >= 0),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_variants_property_id ON property_variants(property_id);

ALTER TABLE property_variants ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_variants' AND policyname = 'Anyone can view property variants') THEN
    CREATE POLICY "Anyone can view property variants" ON property_variants FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_variants' AND policyname = 'Allow anonymous to insert property variants') THEN
    CREATE POLICY "Allow anonymous to insert property variants" ON property_variants FOR INSERT TO anon WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_variants' AND policyname = 'Allow anonymous to update property variants') THEN
    CREATE POLICY "Allow anonymous to update property variants" ON property_variants FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_variants' AND policyname = 'Allow anonymous to delete property variants') THEN
    CREATE POLICY "Allow anonymous to delete property variants" ON property_variants FOR DELETE TO anon USING (true);
  END IF;
END $$;
