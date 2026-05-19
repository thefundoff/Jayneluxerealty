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
