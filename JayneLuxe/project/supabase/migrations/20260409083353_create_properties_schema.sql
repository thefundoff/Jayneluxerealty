/*
  # Real Estate Properties Database Schema

  1. New Tables
    - `properties` - Core property listings table
    - `property_images` - Images associated with each property

  2. Security
    - Enable RLS on both tables
    - Public read access for anonymous and authenticated users
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price decimal NOT NULL,
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms decimal NOT NULL DEFAULT 0,
  square_feet integer NOT NULL DEFAULT 0,
  location text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  property_type text NOT NULL DEFAULT 'house',
  status text NOT NULL DEFAULT 'available',
  year_built integer,
  parking_spaces integer DEFAULT 0,
  has_pool boolean DEFAULT false,
  has_garden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(property_id, is_primary);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Anyone can view properties'
  ) THEN
    CREATE POLICY "Anyone can view properties"
      ON properties FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'property_images' AND policyname = 'Anyone can view property images'
  ) THEN
    CREATE POLICY "Anyone can view property images"
      ON property_images FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;
