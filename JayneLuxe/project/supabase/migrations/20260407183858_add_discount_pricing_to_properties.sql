/*
  # Add Discount Pricing to Properties

  1. Changes
    - Add `discount_percentage` column (numeric, nullable) - The percentage discount being offered (e.g., 10 for 10% off)
    - Add `discount_price` column (numeric, nullable) - The discounted price after applying the discount
    - Add `discount_end_date` column (timestamptz, nullable) - The date when the discount offer expires
  
  2. Notes
    - All columns are nullable since not all properties will have discounts
    - discount_percentage should be between 0 and 100
    - discount_price should be less than the original price
    - discount_end_date allows time-limited offers
*/

DO $$
BEGIN
  -- Add discount_percentage column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE properties ADD COLUMN discount_percentage numeric CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
  END IF;

  -- Add discount_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'discount_price'
  ) THEN
    ALTER TABLE properties ADD COLUMN discount_price numeric;
  END IF;

  -- Add discount_end_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'discount_end_date'
  ) THEN
    ALTER TABLE properties ADD COLUMN discount_end_date timestamptz;
  END IF;
END $$;