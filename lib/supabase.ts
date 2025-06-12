import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string
          name: string
          company: string
          email: string
          phone: string
          website?: string
          address?: string
          status: 'active' | 'inactive'
          category?: string
          notes?: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          company: string
          email: string
          phone: string
          website?: string
          address?: string
          status?: 'active' | 'inactive'
          category?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string
          email?: string
          phone?: string
          website?: string
          address?: string
          status?: 'active' | 'inactive'
          category?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      vendor_contacts: {
        Row: {
          id: string
          vendor_id: string
          name: string
          email: string
          phone: string
          designation: string
          department?: string
          is_main_contact?: boolean
          last_contacted_date?: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          vendor_id: string
          name: string
          email: string
          phone: string
          designation: string
          department?: string
          is_main_contact?: boolean
          last_contacted_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          name?: string
          email?: string
          phone?: string
          designation?: string
          department?: string
          is_main_contact?: boolean
          last_contacted_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          tech_stack: string[]
          experience: number
          type: 'InHouse' | 'InHouse-Friends' | 'External-LinkedIn' | 'External-Email'
          status: 'available' | 'busy' | 'inactive'
          hourly_rate?: number
          location?: string
          remote_availability?: boolean
          start_date?: string
          skills?: { name: string; level: 'beginner' | 'intermediate' | 'expert' }[]
          certifications?: string[]
          resume_file?: string
          resume_metadata?: {
            url: string
            pathname: string
            contentType: string
            size: number
            uploadedAt: string
            filename: string
          }
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          tech_stack: string[]
          experience: number
          type: 'InHouse' | 'InHouse-Friends' | 'External-LinkedIn' | 'External-Email'
          status?: 'available' | 'busy' | 'inactive'
          hourly_rate?: number
          location?: string
          remote_availability?: boolean
          start_date?: string
          skills?: { name: string; level: 'beginner' | 'intermediate' | 'expert' }[]
          certifications?: string[]
          resume_file?: string
          resume_metadata?: {
            url: string
            pathname: string
            contentType: string
            size: number
            uploadedAt: string
            filename: string
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          tech_stack?: string[]
          experience?: number
          type?: 'InHouse' | 'InHouse-Friends' | 'External-LinkedIn' | 'External-Email'
          status?: 'available' | 'busy' | 'inactive'
          hourly_rate?: number
          location?: string
          remote_availability?: boolean
          start_date?: string
          skills?: { name: string; level: 'beginner' | 'intermediate' | 'expert' }[]
          certifications?: string[]
          resume_file?: string
          resume_metadata?: {
            url: string
            pathname: string
            contentType: string
            size: number
            uploadedAt: string
            filename: string
          }
          created_at?: string
          updated_at?: string
        }
      }
      job_requirements: {
        Row: {
          id: string
          title: string
          description: string
          tech_stack: string[]
          experience: number
          location?: string
          remote_available?: boolean
          budget?: number
          duration?: string
          priority: 'low' | 'medium' | 'high'
          status: 'open' | 'in-progress' | 'filled' | 'cancelled'
          client_name?: string
          contact_person?: string
          contact_email?: string
          contact_phone?: string
          start_date?: string
          end_date?: string
          requirements?: string[]
          benefits?: string[]
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          tech_stack: string[]
          experience: number
          location?: string
          remote_available?: boolean
          budget?: number
          duration?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'open' | 'in-progress' | 'filled' | 'cancelled'
          client_name?: string
          contact_person?: string
          contact_email?: string
          contact_phone?: string
          start_date?: string
          end_date?: string
          requirements?: string[]
          benefits?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          tech_stack?: string[]
          experience?: number
          location?: string
          remote_available?: boolean
          budget?: number
          duration?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'open' | 'in-progress' | 'filled' | 'cancelled'
          client_name?: string
          contact_person?: string
          contact_email?: string
          contact_phone?: string
          start_date?: string
          end_date?: string
          requirements?: string[]
          benefits?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      process_flows: {
        Row: {
          id: string
          job_id: string
          resource_id: string
          status: 'resume-submitted' | 'screening-scheduled' | 'screening-cleared' | 'client-screening-scheduled' | 'client-screening-cleared' | 'final-interview-scheduled' | 'cleared' | 'rejected'
          scheduled_date?: string
          notes: string
          created_at: string
          updated_at?: string
          updated_by?: string
        }
        Insert: {
          id?: string
          job_id: string
          resource_id: string
          status: 'resume-submitted' | 'screening-scheduled' | 'screening-cleared' | 'client-screening-scheduled' | 'client-screening-cleared' | 'final-interview-scheduled' | 'cleared' | 'rejected'
          scheduled_date?: string
          notes: string
          created_at?: string
          updated_at?: string
          updated_by?: string
        }
        Update: {
          id?: string
          job_id?: string
          resource_id?: string
          status?: 'resume-submitted' | 'screening-scheduled' | 'screening-cleared' | 'client-screening-scheduled' | 'client-screening-cleared' | 'final-interview-scheduled' | 'cleared' | 'rejected'
          scheduled_date?: string
          notes?: string
          created_at?: string
          updated_at?: string
          updated_by?: string
        }
      }
      file_categories: {
        Row: {
          id: string
          name: string
          description?: string
          parent_id?: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          parent_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          parent_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          name: string
          original_filename: string
          description?: string
          category_id?: string
          size: number
          content_type: string
          pathname: string
          url: string
          entity_type?: 'vendor' | 'resource' | 'job' | 'process' | 'other'
          entity_id?: string
          tags?: string[]
          uploaded_by: string
          uploaded_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          original_filename: string
          description?: string
          category_id?: string
          size: number
          content_type: string
          pathname: string
          url: string
          entity_type?: 'vendor' | 'resource' | 'job' | 'process' | 'other'
          entity_id?: string
          tags?: string[]
          uploaded_by: string
          uploaded_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          original_filename?: string
          description?: string
          category_id?: string
          size?: number
          content_type?: string
          pathname?: string
          url?: string
          entity_type?: 'vendor' | 'resource' | 'job' | 'process' | 'other'
          entity_id?: string
          tags?: string[]
          uploaded_by?: string
          uploaded_at?: string
          updated_at?: string
        }
      }
      tech_stack_skills: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
    }
  }
}

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Create Supabase client with proper error handling
let supabase: ReturnType<typeof createClient<Database>> | null = null

if (isSupabaseConfigured()) {
  try {
    supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
  }
}

export { supabase, isSupabaseConfigured }
