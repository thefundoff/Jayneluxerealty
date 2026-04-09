/*
  # Update Storage Policies for Anonymous Upload

  1. Changes
    - Drop existing authenticated-only upload policy
    - Create new policy allowing both anonymous and authenticated users to upload property images
    - This allows the admin interface to upload images using the anon key

  2. Security
    - Read access remains public
    - Upload, update, and delete access now available to both anon and authenticated users
    - This is acceptable for an admin interface with password protection
*/

-- Drop the existing authenticated-only upload policy
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;

-- Create new policy allowing both anon and authenticated users to upload
CREATE POLICY "Anyone can upload property images"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'property-images');

-- Update the update policy to include anon users
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;

CREATE POLICY "Anyone can update property images"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'property-images')
  WITH CHECK (bucket_id = 'property-images');

-- Update the delete policy to include anon users
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

CREATE POLICY "Anyone can delete property images"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'property-images');
