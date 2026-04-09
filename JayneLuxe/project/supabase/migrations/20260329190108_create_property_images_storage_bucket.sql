/*
  # Create Property Images Storage Bucket

  1. Storage Setup
    - Creates the `property-images` storage bucket for storing property photos
    - Enables public access for the bucket so images can be viewed by all users
  
  2. Security Policies
    - Allow anonymous users to view/read images (public access)
    - Allow anonymous users to upload images (for admin functionality)
    - Images are organized in a `properties/` folder structure
  
  3. Notes
    - Bucket is public so property images are accessible to all visitors
    - Upload is enabled for anonymous users to support the admin panel
    - All images will be stored with public URLs
*/

-- Create the storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view/download images (public read access)
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Allow anonymous users to upload images (for admin panel)
CREATE POLICY "Allow anonymous uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images');

-- Allow anonymous users to update images
CREATE POLICY "Allow anonymous updates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-images');

-- Allow anonymous users to delete images
CREATE POLICY "Allow anonymous deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images');
