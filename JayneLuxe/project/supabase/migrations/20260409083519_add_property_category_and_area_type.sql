/*
  # Add Property Category and Area Type Columns

  1. Changes
    - Add `property_category` column (luxury, premium, low-income)
    - Add `area_type` column (prime, emerging, suburb)
    - Add indexes for filtering performance
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'property_category'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN property_category text 
    CHECK (property_category IN ('luxury', 'premium', 'low-income'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'area_type'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN area_type text 
    CHECK (area_type IN ('prime', 'emerging', 'suburb'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_properties_property_category ON properties(property_category);
CREATE INDEX IF NOT EXISTS idx_properties_area_type ON properties(area_type);
