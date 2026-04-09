/*
  # Add Property Type and Area Type Classification

  1. Schema Changes
    - Add `property_type` column to properties table
      - Values: 'luxury', 'premium', 'low-income'
      - Helps categorize properties by class/affordability
    - Add `area_type` column to properties table
      - Values: 'prime', 'emerging', 'suburb'
      - Helps categorize estate lands by area classification
  
  2. Notes
    - Both columns are optional to support existing properties
    - Default values not set to allow flexibility
    - Enables advanced filtering on the frontend
*/

-- Add property_type column for property classification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'property_type'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN property_type text 
    CHECK (property_type IN ('luxury', 'premium', 'low-income'));
  END IF;
END $$;

-- Add area_type column for estate land classification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'area_type'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN area_type text 
    CHECK (area_type IN ('prime', 'emerging', 'suburb'));
  END IF;
END $$;

-- Add index for filtering performance
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_area_type ON properties(area_type);
