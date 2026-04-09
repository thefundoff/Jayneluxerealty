/*
  # Real Estate Properties Database Schema

  ## Overview
  Creates the database structure for a real estate listing web application with properties and their associated images.

  ## New Tables
  
  ### `properties`
  Core table storing property listing information:
  - `id` (uuid, primary key) - Unique identifier for each property
  - `title` (text) - Property title/name
  - `description` (text) - Detailed property description
  - `price` (decimal) - Property price in dollars
  - `bedrooms` (integer) - Number of bedrooms
  - `bathrooms` (decimal) - Number of bathrooms (supports half baths like 2.5)
  - `square_feet` (integer) - Property size in square feet
  - `location` (text) - Property address/location
  - `city` (text) - City where property is located
  - `state` (text) - State where property is located
  - `property_type` (text) - Type: house, apartment, condo, townhouse, villa
  - `status` (text) - Listing status: available, pending, sold
  - `year_built` (integer) - Year the property was built
  - `parking_spaces` (integer) - Number of parking spaces
  - `has_pool` (boolean) - Whether property has a pool
  - `has_garden` (boolean) - Whether property has a garden
  - `created_at` (timestamptz) - Timestamp of listing creation
  
  ### `property_images`
  Table storing multiple images for each property:
  - `id` (uuid, primary key) - Unique identifier for each image
  - `property_id` (uuid, foreign key) - References parent property
  - `image_url` (text) - URL to the property image
  - `is_primary` (boolean) - Whether this is the main display image
  - `display_order` (integer) - Order for displaying images in gallery
  - `created_at` (timestamptz) - Timestamp of image upload

  ## Security
  - Enable Row Level Security (RLS) on both tables
  - Public read access for all users (property listings are public)
  - No insert/update/delete policies (admin-only operations, managed separately)

  ## Notes
  - Properties can have multiple images through the property_images relationship
  - Each property should have one primary image (is_primary = true)
  - Images are ordered by display_order for consistent gallery presentation
  - Bathroom count uses decimal to support half bathrooms (e.g., 2.5)
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price decimal NOT NULL,
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms decimal NOT NULL DEFAULT 0,
  square_feet integer NOT NULL DEFAULT 0,
  location text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  property_type text NOT NULL DEFAULT 'house',
  status text NOT NULL DEFAULT 'available',
  year_built integer,
  parking_spaces integer DEFAULT 0,
  has_pool boolean DEFAULT false,
  has_garden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(property_id, is_primary);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view properties"
  ON properties FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view property images"
  ON property_images FOR SELECT
  TO anon, authenticated
  USING (true);
