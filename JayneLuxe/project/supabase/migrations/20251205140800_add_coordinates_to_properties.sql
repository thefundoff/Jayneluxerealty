/*
  # Add coordinates for map display

  ## Changes
  - Add latitude and longitude columns to properties table for map integration
  - Store coordinates for Google Maps display on property details page

  ## New Columns
  - `latitude` (decimal) - Latitude coordinate for property location
  - `longitude` (decimal) - Longitude coordinate for property location
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE properties ADD COLUMN latitude decimal DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE properties ADD COLUMN longitude decimal DEFAULT 0;
  END IF;
END $$;
