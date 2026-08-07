export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
        Relationships: any[]
      }
      roles: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          is_system: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          is_system?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          is_system?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          id: string
          code: string
          module: string
          action: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          code: string
          module: string
          action: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          module?: string
          action?: string
          description?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          role_id: string
          permission_id: string
        }
        Insert: {
          role_id: string
          permission_id: string
        }
        Update: {
          role_id?: string
          permission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          }
        ]
      }
      module_permissions: {
        Row: {
          id: string
          role: string
          module: string
          can_read: boolean | null
          can_create: boolean | null
          can_edit: boolean | null
          can_delete: boolean | null
          can_publish: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          role: string
          module: string
          can_read?: boolean | null
          can_create?: boolean | null
          can_edit?: boolean | null
          can_delete?: boolean | null
          can_publish?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          role?: string
          module?: string
          can_read?: boolean | null
          can_create?: boolean | null
          can_edit?: boolean | null
          can_delete?: boolean | null
          can_publish?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          name: string
          slug: string
          official_name: string | null
          description: string | null
          head_of_office: string | null
          contact_number: string | null
          email: string | null
          office_hours: string | null
          location: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          official_name?: string | null
          description?: string | null
          head_of_office?: string | null
          contact_number?: string | null
          email?: string | null
          office_hours?: string | null
          location?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          official_name?: string | null
          description?: string | null
          head_of_office?: string | null
          contact_number?: string | null
          email?: string | null
          office_hours?: string | null
          location?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      barangays: {
        Row: {
          id: string
          name: string
          slug: string
          captain: string | null
          population: number | null
          contact_number: string | null
          office_address: string | null
          office_hours: string | null
          cover_image: string | null
          latitude: number | null
          longitude: number | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          captain?: string | null
          population?: number | null
          contact_number?: string | null
          office_address?: string | null
          office_hours?: string | null
          cover_image?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          captain?: string | null
          population?: number | null
          contact_number?: string | null
          office_address?: string | null
          office_hours?: string | null
          cover_image?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      officials: {
        Row: {
          id: string
          name: string
          role: string
          level: number | null
          display_order: number | null
          image_url: string | null
          biography: string | null
          contact_info: string | null
          department_id: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          role: string
          level?: number | null
          display_order?: number | null
          image_url?: string | null
          biography?: string | null
          contact_info?: string | null
          department_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: string
          level?: number | null
          display_order?: number | null
          image_url?: string | null
          biography?: string | null
          contact_info?: string | null
          department_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officials_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          barangay_id: string | null
          department_id: string | null
          is_verified: boolean | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          barangay_id?: string | null
          department_id?: string | null
          is_verified?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          barangay_id?: string | null
          department_id?: string | null
          is_verified?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      municipal_services: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          purpose: string | null
          requirements: string[] | null
          processing_time: string | null
          fees: string | null
          office_responsible_id: string | null
          office_responsible: string | null
          office_hours: string | null
          contact_info: string | null
          physical_address: string | null
          status: 'available' | 'coming-soon' | 'maintenance' | string | null
          downloadable_forms: Json | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          purpose?: string | null
          requirements?: string[] | null
          processing_time?: string | null
          fees?: string | null
          office_responsible_id?: string | null
          office_responsible?: string | null
          office_hours?: string | null
          contact_info?: string | null
          physical_address?: string | null
          status?: 'available' | 'coming-soon' | 'maintenance' | string | null
          downloadable_forms?: Json | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          purpose?: string | null
          requirements?: string[] | null
          processing_time?: string | null
          fees?: string | null
          office_responsible_id?: string | null
          office_responsible?: string | null
          office_hours?: string | null
          contact_info?: string | null
          physical_address?: string | null
          status?: 'available' | 'coming-soon' | 'maintenance' | string | null
          downloadable_forms?: Json | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "municipal_services_office_responsible_id_fkey"
            columns: ["office_responsible_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      citizen_charters: {
        Row: {
          id: string
          office_id: string | null
          office: string
          service_name: string
          requirements: string[] | null
          processing_time: string | null
          fees: string | null
          steps: Json | null
          downloadable_forms: Json | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          office_id?: string | null
          office: string
          service_name: string
          requirements?: string[] | null
          processing_time?: string | null
          fees?: string | null
          steps?: Json | null
          downloadable_forms?: Json | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          office_id?: string | null
          office?: string
          service_name?: string
          requirements?: string[] | null
          processing_time?: string | null
          fees?: string | null
          steps?: Json | null
          downloadable_forms?: Json | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_charters_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          module: string
          description: string | null
          color: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          module: string
          description?: string | null
          color?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          module?: string
          description?: string | null
          color?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          content: string
          image_url: string | null
          file_url: string | null
          category_id: string | null
          category: string | null
          author: string | null
          date: string | null
          status: 'draft' | 'published' | 'archived' | string | null
          barangay_id: string | null
          is_pinned: boolean | null
          is_featured: boolean | null
          published_at: string | null
          views_count: number | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          content: string
          image_url?: string | null
          file_url?: string | null
          category_id?: string | null
          category?: string | null
          author?: string | null
          date?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          barangay_id?: string | null
          is_pinned?: boolean | null
          is_featured?: boolean | null
          published_at?: string | null
          views_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          content?: string
          image_url?: string | null
          file_url?: string | null
          category_id?: string | null
          category?: string | null
          author?: string | null
          date?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          barangay_id?: string | null
          is_pinned?: boolean | null
          is_featured?: boolean | null
          published_at?: string | null
          views_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          }
        ]
      }
      news_tags: {
        Row: {
          news_id: string
          tag_id: string
        }
        Insert: {
          news_id: string
          tag_id: string
        }
        Update: {
          news_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_tags_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          time: string | null
          venue: string | null
          banner_image: string | null
          category: string | null
          status: 'draft' | 'published' | 'archived' | string | null
          barangay_id: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          time?: string | null
          venue?: string | null
          banner_image?: string | null
          category?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          barangay_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          time?: string | null
          venue?: string | null
          banner_image?: string | null
          category?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          barangay_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          }
        ]
      }
      tourism_spots: {
        Row: {
          id: string
          name: string
          slug: string | null
          description: string
          gallery_images: string[] | null
          location: string
          google_maps_link: string | null
          opening_hours: string | null
          contact_details: string | null
          featured_image: string | null
          category: string | null
          is_featured: boolean | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          description: string
          gallery_images?: string[] | null
          location: string
          google_maps_link?: string | null
          opening_hours?: string | null
          contact_details?: string | null
          featured_image?: string | null
          category?: string | null
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          description?: string
          gallery_images?: string[] | null
          location?: string
          google_maps_link?: string | null
          opening_hours?: string | null
          contact_details?: string | null
          featured_image?: string | null
          category?: string | null
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      emergency_advisories: {
        Row: {
          id: string
          title: string
          type: string
          severity: 'info' | 'watch' | 'warning' | 'emergency' | 'critical' | 'danger'
          content: string
          affected_barangays: string[] | null
          is_pinned: boolean | null
          is_popup: boolean | null
          banner_color: string | null
          status: 'draft' | 'published' | 'archived' | 'expired' | string | null
          start_date: string | null
          expiry_date: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          type: string
          severity: 'info' | 'watch' | 'warning' | 'emergency' | 'critical' | 'danger'
          content: string
          affected_barangays?: string[] | null
          is_pinned?: boolean | null
          is_popup?: boolean | null
          banner_color?: string | null
          status?: 'draft' | 'published' | 'archived' | 'expired' | string | null
          start_date?: string | null
          expiry_date?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          type?: string
          severity?: 'info' | 'watch' | 'warning' | 'emergency' | 'critical' | 'danger'
          content?: string
          affected_barangays?: string[] | null
          is_pinned?: boolean | null
          is_popup?: boolean | null
          banner_color?: string | null
          status?: 'draft' | 'published' | 'archived' | 'expired' | string | null
          start_date?: string | null
          expiry_date?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      infrastructure_projects: {
        Row: {
          id: string
          project_code: string
          title: string
          category: string
          description: string | null
          status: 'planning' | 'procurement' | 'ongoing' | 'delayed' | 'completed' | 'cancelled' | string | null
          budget: number | null
          funding_source: string | null
          contractor: string | null
          project_engineer: string | null
          barangay_id: string | null
          barangay: string | null
          latitude: number | null
          longitude: number | null
          progress_percentage: number | null
          start_date: string | null
          target_completion_date: string | null
          actual_completion_date: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          project_code?: string
          title?: string
          category?: string
          description?: string | null
          status?: 'planning' | 'procurement' | 'ongoing' | 'delayed' | 'completed' | 'cancelled' | string | null
          budget?: number | null
          funding_source?: string | null
          contractor?: string | null
          project_engineer?: string | null
          barangay_id?: string | null
          barangay?: string | null
          latitude?: number | null
          longitude?: number | null
          progress_percentage?: number | null
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          project_code?: string
          title?: string
          category?: string
          description?: string | null
          status?: 'planning' | 'procurement' | 'ongoing' | 'delayed' | 'completed' | 'cancelled' | string | null
          budget?: number | null
          funding_source?: string | null
          contractor?: string | null
          project_engineer?: string | null
          barangay_id?: string | null
          barangay?: string | null
          latitude?: number | null
          longitude?: number | null
          progress_percentage?: number | null
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_projects_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          }
        ]
      }
      infrastructure_updates: {
        Row: {
          id: string
          project_id: string | null
          update_title: string
          update_description: string | null
          progress_percentage: number | null
          milestone_reached: string | null
          updated_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          update_title: string
          update_description?: string | null
          progress_percentage?: number | null
          milestone_reached?: string | null
          updated_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          update_title?: string
          update_description?: string | null
          progress_percentage?: number | null
          milestone_reached?: string | null
          updated_by?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "infrastructure_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      infrastructure_milestones: {
        Row: {
          id: string
          project_id: string | null
          title: string
          description: string | null
          target_date: string | null
          actual_date: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          title: string
          description?: string | null
          target_date?: string | null
          actual_date?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          target_date?: string | null
          actual_date?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "infrastructure_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      infrastructure_media: {
        Row: {
          id: string
          project_id: string | null
          media_type: string | null
          url: string
          caption: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          media_type?: string | null
          url: string
          caption?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          media_type?: string | null
          url?: string
          caption?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "infrastructure_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      legislative_documents: {
        Row: {
          id: string
          document_type: 'ordinance' | 'resolution' | 'executive_order' | 'memorandum'
          document_number: string
          title: string
          category: string | null
          summary: string | null
          full_text: string | null
          file_url: string | null
          publication_date: string | null
          effective_date: string | null
          status: 'draft' | 'published' | 'archived' | string | null
          views_count: number | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          document_type?: 'ordinance' | 'resolution' | 'executive_order' | 'memorandum' | string
          document_number?: string
          title?: string
          category?: string | null
          summary?: string | null
          full_text?: string | null
          file_url?: string | null
          publication_date?: string | null
          effective_date?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          views_count?: number | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          document_type?: 'ordinance' | 'resolution' | 'executive_order' | 'memorandum'
          document_number?: string
          title?: string
          category?: string | null
          summary?: string | null
          full_text?: string | null
          file_url?: string | null
          publication_date?: string | null
          effective_date?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          views_count?: number | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      transparency_documents: {
        Row: {
          id: string
          title: string
          category: string
          department: string | null
          fiscal_year: number | null
          quarter: string | null
          file_url: string | null
          file_size: string | null
          status: 'draft' | 'published' | 'archived' | string | null
          downloads_count: number | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          category: string
          department?: string | null
          fiscal_year?: number | null
          quarter?: string | null
          file_url?: string | null
          file_size?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          downloads_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          category?: string
          department?: string | null
          fiscal_year?: number | null
          quarter?: string | null
          file_url?: string | null
          file_size?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          downloads_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      dynamic_pages: {
        Row: {
          id: string
          slug: string
          title: string
          subtitle: string | null
          status: 'draft' | 'published' | 'archived' | string | null
          meta_title: string | null
          meta_description: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          subtitle?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          meta_title?: string | null
          meta_description?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          subtitle?: string | null
          status?: 'draft' | 'published' | 'archived' | string | null
          meta_title?: string | null
          meta_description?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      page_blocks: {
        Row: {
          id: string
          page_id: string | null
          block_type: string
          content: Json | null
          block_order: number | null
          is_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          page_id?: string | null
          block_type: string
          content?: Json | null
          block_order?: number | null
          is_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          page_id?: string | null
          block_type?: string
          content?: Json | null
          block_order?: number | null
          is_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "dynamic_pages"
            referencedColumns: ["id"]
          }
        ]
      }
      homepage_widgets: {
        Row: {
          id: string
          widget_type: string
          title: string
          subtitle: string | null
          config: Json | null
          is_enabled: boolean | null
          widget_order: number | null
          start_date: string | null
          end_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          widget_type: string
          title: string
          subtitle?: string | null
          config?: Json | null
          is_enabled?: boolean | null
          widget_order?: number | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          widget_type?: string
          title?: string
          subtitle?: string | null
          config?: Json | null
          is_enabled?: boolean | null
          widget_order?: number | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          image_url: string
          cta_label: string | null
          cta_url: string | null
          slide_order: number | null
          is_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          image_url: string
          cta_label?: string | null
          cta_url?: string | null
          slide_order?: number | null
          is_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          image_url?: string
          cta_label?: string | null
          cta_url?: string | null
          slide_order?: number | null
          is_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      media_folders: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          path: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          path: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          path?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          }
        ]
      }
      media_assets: {
        Row: {
          id: string
          folder_id: string | null
          filename: string
          original_name: string
          mime_type: string
          file_size: number | null
          storage_path: string
          public_url: string
          alt_text: string | null
          caption: string | null
          width: number | null
          height: number | null
          usage_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          folder_id?: string | null
          filename: string
          original_name: string
          mime_type: string
          file_size?: number | null
          storage_path: string
          public_url: string
          alt_text?: string | null
          caption?: string | null
          width?: number | null
          height?: number | null
          usage_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          folder_id?: string | null
          filename?: string
          original_name?: string
          mime_type?: string
          file_size?: number | null
          storage_path?: string
          public_url?: string
          alt_text?: string | null
          caption?: string | null
          width?: number | null
          height?: number | null
          usage_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          }
        ]
      }
      meetings: {
        Row: {
          id: string
          title: string
          meeting_date: string | null
          location: string | null
          attendees: string[] | null
          transcript: string | null
          summary: string | null
          action_items: Json | null
          audio_url: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          meeting_date?: string | null
          location?: string | null
          attendees?: string[] | null
          transcript?: string | null
          summary?: string | null
          action_items?: Json | null
          audio_url?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          meeting_date?: string | null
          location?: string | null
          attendees?: string[] | null
          transcript?: string | null
          summary?: string | null
          action_items?: Json | null
          audio_url?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      gad_beneficiaries: {
        Row: {
          id: string
          full_name: string
          gender: string | null
          age: number | null
          barangay_id: string | null
          sector: string | null
          program_attended: string | null
          assistance_type: string | null
          amount: number | null
          date_assisted: string | null
          remarks: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          gender?: string | null
          age?: number | null
          barangay_id?: string | null
          sector?: string | null
          program_attended?: string | null
          assistance_type?: string | null
          amount?: number | null
          date_assisted?: string | null
          remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          gender?: string | null
          age?: number | null
          barangay_id?: string | null
          sector?: string | null
          program_attended?: string | null
          assistance_type?: string | null
          amount?: number | null
          date_assisted?: string | null
          remarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gad_beneficiaries_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          user_email: string | null
          action: string
          entity: string | null
          entity_id: string | null
          target_table: string | null
          target_id: string | null
          details: Json | null
          timestamp: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          action: string
          entity?: string | null
          entity_id?: string | null
          target_table?: string | null
          target_id?: string | null
          details?: Json | null
          timestamp?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          action?: string
          entity?: string | null
          entity_id?: string | null
          target_table?: string | null
          target_id?: string | null
          details?: Json | null
          timestamp?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      revision_history: {
        Row: {
          id: string
          entity_name: string
          record_id: string
          version_number: number | null
          data: Json
          changed_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          entity_name: string
          record_id: string
          version_number?: number | null
          data: Json
          changed_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          entity_name?: string
          record_id?: string
          version_number?: number | null
          data?: Json
          changed_by?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          id: string
          ticket_id: string
          document_type: string
          full_name: string
          email: string
          mobile_number: string | null
          barangay_id: string | null
          purpose: string | null
          attachments: string[] | null
          status: string | null
          submitted_at: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          document_type: string
          full_name: string
          email: string
          mobile_number?: string | null
          barangay_id?: string | null
          purpose?: string | null
          attachments?: string[] | null
          status?: string | null
          submitted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          document_type?: string
          full_name?: string
          email?: string
          mobile_number?: string | null
          barangay_id?: string | null
          purpose?: string | null
          attachments?: string[] | null
          status?: string | null
          submitted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      service_request_history: {
        Row: {
          id: string
          request_id: string | null
          status: string
          remarks: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          request_id?: string | null
          status: string
          remarks?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string | null
          status?: string
          remarks?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_request_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          category: string | null
          department_id: string | null
          user_id: string | null
          is_read: boolean | null
          is_archived: boolean | null
          action_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          message: string
          category?: string | null
          department_id?: string | null
          user_id?: string | null
          is_read?: boolean | null
          is_archived?: boolean | null
          action_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          message?: string
          category?: string | null
          department_id?: string | null
          user_id?: string | null
          is_read?: boolean | null
          is_archived?: boolean | null
          action_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, any>
        Relationships: any[]
      }
      citizens_charter: {
        Row: {
          id: string | null
          office_id: string | null
          office: string | null
          service_name: string | null
          requirements: string[] | null
          processing_time: string | null
          fees: string | null
          steps: Json | null
          downloadable_forms: Json | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Relationships: []
      }
      downloadables: {
        Row: {
          id: string | null
          title: string | null
          category: string | null
          department: string | null
          fiscal_year: number | null
          quarter: string | null
          file_url: string | null
          file_size: string | null
          status: string | null
          downloads_count: number | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Relationships: []
      }
      page_contents: {
        Row: {
          id: string | null
          slug: string | null
          title: string | null
          subtitle: string | null
          status: string | null
          meta_title: string | null
          meta_description: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Relationships: []
      }
      homepage_slides: {
        Row: {
          id: string | null
          title: string | null
          subtitle: string | null
          image_url: string | null
          cta_label: string | null
          cta_url: string | null
          slide_order: number | null
          is_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      certificate_requests: {
        Row: {
          id: string | null
          ticket_id: string | null
          document_type: string | null
          full_name: string | null
          email: string | null
          mobile_number: string | null
          barangay_id: string | null
          purpose: string | null
          attachments: string[] | null
          status: string | null
          submitted_at: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, any>
        Returns: any
      }
      is_staff_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      publication_status: 'draft' | 'published' | 'archived'
      advisory_severity: 'info' | 'watch' | 'warning' | 'emergency' | 'critical' | 'danger'
      infrastructure_status: 'planning' | 'procurement' | 'ongoing' | 'delayed' | 'completed' | 'cancelled'
      legislative_doc_type: 'ordinance' | 'resolution' | 'executive_order' | 'memorandum'
      service_availability_status: 'available' | 'coming-soon' | 'maintenance'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
