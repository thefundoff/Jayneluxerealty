/*
  # Add Discount Pricing to Properties

  1. Changes
    - Add `discount_percentage` column (0-100)
    - Add `discount_price` column
    - Add `discount_end_date` column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE properties ADD COLUMN discount_percentage numeric CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'discount_price'
  ) THEN
    ALTER TABLE properties ADD COLUMN discount_price numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'discount_end_date'
  ) THEN
    ALTER TABLE properties ADD COLUMN discount_end_date timestamptz;
  END IF;
END $$;
