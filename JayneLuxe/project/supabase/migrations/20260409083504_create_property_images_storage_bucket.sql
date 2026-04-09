/*
  # Create Property Images Storage Bucket

  1. Storage Setup
    - Creates the `property-images` storage bucket (public)
  
  2. Security Policies
    - Public read access
    - Anonymous users can upload, update, delete (for admin panel)
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'property-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow anonymous uploads'
  ) THEN
    CREATE POLICY "Allow anonymous uploads"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'property-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow anonymous updates'
  ) THEN
    CREATE POLICY "Allow anonymous updates"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'property-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow anonymous deletes'
  ) THEN
    CREATE POLICY "Allow anonymous deletes"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'property-images');
  END IF;
END $$;
