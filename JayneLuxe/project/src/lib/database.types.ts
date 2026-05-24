export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          bedrooms: number
          bathrooms: number
          square_feet: number
          location: string
          city: string
          state: string
          property_type: string
          status: string
          year_built: number | null
          parking_spaces: number
          has_pool: boolean
          has_garden: boolean
          latitude: number | null
          longitude: number | null
          property_category: string | null
          area_type: string | null
          discount_percentage: number | null
          discount_price: number | null
          discount_end_date: string | null
          developer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          location: string
          city: string
          state: string
          property_type?: string
          status?: string
          year_built?: number | null
          parking_spaces?: number
          has_pool?: boolean
          has_garden?: boolean
          latitude?: number
          longitude?: number
          property_category?: string | null
          area_type?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          discount_end_date?: string | null
          developer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          location?: string
          city?: string
          state?: string
          property_type?: string
          status?: string
          year_built?: number | null
          parking_spaces?: number
          has_pool?: boolean
          has_garden?: boolean
          latitude?: number
          longitude?: number
          property_category?: string | null
          area_type?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          discount_end_date?: string | null
          developer?: string | null
          created_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          image_url: string
          is_primary: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          image_url: string
          is_primary?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          image_url?: string
          is_primary?: boolean
          display_order?: number
          created_at?: string
        }
      }
      property_variants: {
        Row: {
          id: string
          property_id: string
          label: string
          description: string | null
          square_feet: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          label: string
          description?: string | null
          square_feet: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          label?: string
          description?: string | null
          square_feet?: number
          price?: number
          created_at?: string
        }
      }
      inspection_slots: {
        Row: {
          id: string
          property_id: string
          slot_date: string
          slot_time: string
          label: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          slot_date: string
          slot_time: string
          label?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          slot_date?: string
          slot_time?: string
          label?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyImage = Database['public']['Tables']['property_images']['Row'];
export type PropertyVariant = Database['public']['Tables']['property_variants']['Row'];
export type InspectionSlot = Database['public']['Tables']['inspection_slots']['Row'];

export interface PropertyWithImages extends Property {
  property_images: PropertyImage[];
  property_variants: PropertyVariant[];
}

export interface JobOpening {
  id: string;
  title: string;
  slug: string | null;
  department: string | null;
  location: string | null;
  type: string;
  experience_level: string | null;
  salary_range: string | null;
  commission_details: string | null;
  description: string | null;
  short_description: string | null;
  full_description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits_list: string | null;
  is_active: boolean;
  accept_applications: boolean;
  application_deadline: string | null;
  featured: boolean;
  allow_supporting_docs: boolean;
  created_at: string;
}

export interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  job_opening_id: string | null;
  cover_letter: string | null;
  cover_letter_url: string | null;
  address: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  supporting_doc_url: string | null;
  consent_given: boolean;
  resume_url: string;
  years_experience: number | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
  read: boolean;
}

export interface GeneralApplication {
  id: string;
  name: string;
  email: string;
  resume_url: string;
  area_of_interest: string | null;
  notes: string | null;
  created_at: string;
  read: boolean;
}
