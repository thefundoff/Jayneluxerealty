/*
  # Add Admin Policies for Properties Management

  - Allow anonymous users to insert, update, delete properties and property images
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Allow anonymous to insert properties'
  ) THEN
    CREATE POLICY "Allow anonymous to insert properties"
      ON properties FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Allow anonymous to update properties'
  ) THEN
    CREATE POLICY "Allow anonymous to update properties"
      ON properties FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Allow anonymous to delete properties'
  ) THEN
    CREATE POLICY "Allow anonymous to delete properties"
      ON properties FOR DELETE
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'property_images' AND policyname = 'Allow anonymous to insert property images'
  ) THEN
    CREATE POLICY "Allow anonymous to insert property images"
      ON property_images FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'property_images' AND policyname = 'Allow anonymous to update property images'
  ) THEN
    CREATE POLICY "Allow anonymous to update property images"
      ON property_images FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'property_images' AND policyname = 'Allow anonymous to delete property images'
  ) THEN
    CREATE POLICY "Allow anonymous to delete property images"
      ON property_images FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;
