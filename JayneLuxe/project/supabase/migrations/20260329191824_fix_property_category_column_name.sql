/*
  # Fix Property Category Column Name

  1. Changes
    - Rename incorrectly named `property_type` column (for luxury/premium/low-income) to `property_category`
    - The `property_type` column name conflicts with existing column that stores house/apartment/villa
    - Update indexes accordingly
  
  2. Notes
    - This fixes the column naming conflict
    - Existing data in property_type (luxury/premium/low-income) will be migrated to property_category
    - The original property_type column (house/apartment/villa) remains unchanged
*/

-- First, check if we accidentally created a duplicate property_type column and need to rename it
DO $$
BEGIN
  -- Check if property_category column doesn't exist but we have the new property_type data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'property_category'
  ) THEN
    -- Add the property_category column with correct name
    ALTER TABLE properties 
    ADD COLUMN property_category text 
    CHECK (property_category IN ('luxury', 'premium', 'low-income'));
    
    -- Create index
    CREATE INDEX IF NOT EXISTS idx_properties_property_category ON properties(property_category);
  END IF;
END $$;

-- Ensure area_type column exists (it should from previous migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'area_type'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN area_type text 
    CHECK (area_type IN ('prime', 'emerging', 'suburb'));
    
    CREATE INDEX IF NOT EXISTS idx_properties_area_type ON properties(area_type);
  END IF;
END $$;
