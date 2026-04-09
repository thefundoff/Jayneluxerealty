/*
  # Add Admin Policies for Properties Management

  ## Overview
  Adds Row Level Security policies to allow admin operations on properties and property images.

  ## Changes
  1. Policies for properties table:
     - Allow anonymous users to insert new properties
     - Allow anonymous users to update existing properties
     - Allow anonymous users to delete properties

  2. Policies for property_images table:
     - Allow anonymous users to insert new property images
     - Allow anonymous users to update existing property images
     - Allow anonymous users to delete property images

  ## Security Notes
  - These policies allow anonymous access for admin operations
  - In production, consider implementing proper authentication
  - Admin operations are currently protected by client-side password check
*/

-- Add INSERT policy for properties
CREATE POLICY "Allow anonymous to insert properties"
  ON properties FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add UPDATE policy for properties
CREATE POLICY "Allow anonymous to update properties"
  ON properties FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for properties
CREATE POLICY "Allow anonymous to delete properties"
  ON properties FOR DELETE
  TO anon
  USING (true);

-- Add INSERT policy for property_images
CREATE POLICY "Allow anonymous to insert property images"
  ON property_images FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add UPDATE policy for property_images
CREATE POLICY "Allow anonymous to update property images"
  ON property_images FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for property_images
CREATE POLICY "Allow anonymous to delete property images"
  ON property_images FOR DELETE
  TO anon
  USING (true);