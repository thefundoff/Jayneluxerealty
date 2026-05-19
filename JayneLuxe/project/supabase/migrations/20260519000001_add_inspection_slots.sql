CREATE TABLE IF NOT EXISTS inspection_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  label text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE inspection_slots ENABLE ROW LEVEL SECURITY;

-- Public can only read active slots (used in the booking modal)
CREATE POLICY "Public can view active inspection slots"
  ON inspection_slots FOR SELECT
  USING (is_active = true);

-- Authenticated admins can create, update, and delete slots
CREATE POLICY "Authenticated users can manage inspection slots"
  ON inspection_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
