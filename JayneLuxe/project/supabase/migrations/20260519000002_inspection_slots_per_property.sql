-- Drop and recreate with property_id (safe: table has no data yet)
DROP TABLE IF EXISTS inspection_slots;

CREATE TABLE inspection_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  label text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_inspection_slots_property_id ON inspection_slots(property_id);

ALTER TABLE inspection_slots ENABLE ROW LEVEL SECURITY;

-- Public can read active slots for any property (used in booking modal)
CREATE POLICY "Public can view active inspection slots"
  ON inspection_slots FOR SELECT
  USING (is_active = true);

-- Authenticated admins can fully manage slots
CREATE POLICY "Authenticated users can manage inspection slots"
  ON inspection_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
