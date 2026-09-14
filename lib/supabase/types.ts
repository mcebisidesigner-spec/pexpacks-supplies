export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_letter_templates: {
        Row: {
          body_markdown: string
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          body_markdown: string
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          body_markdown?: string
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_letters: {
        Row: {
          body_markdown: string
          created_at: string | null
          id: string
          include_quotation: boolean | null
          last_emailed_at: string | null
          pdf_storage_path: string | null
          quotation_data: Json | null
          quotation_id: string | null
          recipient_address: string | null
          recipient_country: string | null
          recipient_email: string
          recipient_name: string
          recipient_organization: string
          recipient_title: string | null
          recipient_type: string
          reference_number: string
          school_id: string | null
          signatory_name: string
          signatory_title: string
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          body_markdown: string
          created_at?: string | null
          id?: string
          include_quotation?: boolean | null
          last_emailed_at?: string | null
          pdf_storage_path?: string | null
          quotation_data?: Json | null
          quotation_id?: string | null
          recipient_address?: string | null
          recipient_country?: string | null
          recipient_email: string
          recipient_name: string
          recipient_organization: string
          recipient_title?: string | null
          recipient_type: string
          reference_number: string
          school_id?: string | null
          signatory_name?: string
          signatory_title?: string
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          body_markdown?: string
          created_at?: string | null
          id?: string
          include_quotation?: boolean | null
          last_emailed_at?: string | null
          pdf_storage_path?: string | null
          quotation_data?: Json | null
          quotation_id?: string | null
          recipient_address?: string | null
          recipient_country?: string | null
          recipient_email?: string
          recipient_name?: string
          recipient_organization?: string
          recipient_title?: string | null
          recipient_type?: string
          reference_number?: string
          school_id?: string | null
          signatory_name?: string
          signatory_title?: string
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_letters_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_letters_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_school_directory_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_letters_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          approval_type: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_notes: string | null
          entity_id: string
          entity_type: string
          id: string
          reason: string | null
          requested_by: string | null
          status: string
        }
        Insert: {
          approval_type: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          entity_id: string
          entity_type: string
          id?: string
          reason?: string | null
          requested_by?: string | null
          status?: string
        }
        Update: {
          approval_type?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string | null
          requested_by?: string | null
          status?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          alt_text: string | null
          bucket: string
          created_at: string
          folder: string
          height: number | null
          id: string
          mime_type: string | null
          name: string
          path: string
          public_url: string | null
          size_bytes: number
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bucket?: string
          created_at?: string
          folder?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          name: string
          path: string
          public_url?: string | null
          size_bytes?: number
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bucket?: string
          created_at?: string
          folder?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          path?: string
          public_url?: string | null
          size_bytes?: number
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      assigned_forms: {
        Row: {
          created_at: string
          created_by: string | null
          form_key: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          form_key: string
          id?: string
          label: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          form_key?: string
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: number
          ip: string | null
          summary: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: never
          ip?: string | null
          summary: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: never
          ip?: string | null
          summary?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_logs_archive: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          archived_at: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: number
          ip: string | null
          summary: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          archived_at?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id: number
          ip?: string | null
          summary: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          archived_at?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: number
          ip?: string | null
          summary?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      auth_otp_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          used: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          otp_code: string
          used?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          used?: boolean
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: Json
          created_at: string
          excerpt: string | null
          id: string
          image: string | null
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: Json
          created_at?: string
          excerpt?: string | null
          id: string
          image?: string | null
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: Json
          created_at?: string
          excerpt?: string | null
          id?: string
          image?: string | null
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brand_package_claims: {
        Row: {
          applicant_name: string
          branding_preferences: string | null
          business_description: string | null
          business_name: string
          consent: boolean
          created_at: string
          deadline: string | null
          email: string | null
          existing_branding: string | null
          id: string
          notes: string | null
          phone: string | null
          status: string
          submission_id: string | null
          target_audience: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          applicant_name: string
          branding_preferences?: string | null
          business_description?: string | null
          business_name: string
          consent?: boolean
          created_at?: string
          deadline?: string | null
          email?: string | null
          existing_branding?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          submission_id?: string | null
          target_audience?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          applicant_name?: string
          branding_preferences?: string | null
          business_description?: string | null
          business_name?: string
          consent?: boolean
          created_at?: string
          deadline?: string | null
          email?: string | null
          existing_branding?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          submission_id?: string | null
          target_audience?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_announcements: {
        Row: {
          badge_text: string
          created_at: string | null
          display_location: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          link_label: string | null
          link_url: string | null
          message: string
          published_at: string
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          badge_text: string
          created_at?: string | null
          display_location?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          link_label?: string | null
          link_url?: string | null
          message: string
          published_at?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          badge_text?: string
          created_at?: string | null
          display_location?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          link_label?: string | null
          link_url?: string | null
          message?: string
          published_at?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cms_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_published: boolean | null
          published_at: string
          question: string
          sort_order: number | null
          status: string
          target_page: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string
          question: string
          sort_order?: number | null
          status?: string
          target_page?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string
          question?: string
          sort_order?: number | null
          status?: string
          target_page?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cms_resources: {
        Row: {
          author: string | null
          category: string
          content: Json | null
          created_at: string | null
          description: string | null
          download_count: number | null
          expires_at: string | null
          featured: boolean
          file_size_label: string | null
          file_type: string | null
          file_url: string | null
          id: string
          image: string | null
          is_public: boolean | null
          kind: string
          published_at: string
          slug: string | null
          sort_order: number | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          author?: string | null
          category?: string
          content?: Json | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          expires_at?: string | null
          featured?: boolean
          file_size_label?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image?: string | null
          is_public?: boolean | null
          kind?: string
          published_at?: string
          slug?: string | null
          sort_order?: number | null
          status?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          author?: string | null
          category?: string
          content?: Json | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          expires_at?: string | null
          featured?: boolean
          file_size_label?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image?: string | null
          is_public?: boolean | null
          kind?: string
          published_at?: string
          slug?: string | null
          sort_order?: number | null
          status?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cms_testimonials: {
        Row: {
          author_name: string
          author_role: string
          avatar_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_featured: boolean | null
          published_at: string
          quote: string
          rating: number | null
          school_id: string | null
          school_name: string | null
          sort_order: number | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          author_name: string
          author_role: string
          avatar_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string
          quote: string
          rating?: number | null
          school_id?: string | null
          school_name?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          author_name?: string
          author_role?: string
          avatar_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string
          quote?: string
          rating?: number | null
          school_id?: string | null
          school_name?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_testimonials_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_school_directory_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_testimonials_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dashboard_summaries: {
        Row: {
          active_packs: number
          awaiting_fulfilment: number
          completed_orders: number
          id: string
          last_updated_at: string
          orders_at_risk_count: number
          orders_this_week: number
          orders_today: number
          paid_orders: number
          paid_orders_count: number
          pending_orders: number
          procurement_coverage_pct: number
          procurement_outstanding: number
          ready_to_pack_count: number
          total_orders: number
          total_packs: number
          total_revenue: number
          total_schools: number
        }
        Insert: {
          active_packs?: number
          awaiting_fulfilment?: number
          completed_orders?: number
          id?: string
          last_updated_at?: string
          orders_at_risk_count?: number
          orders_this_week?: number
          orders_today?: number
          paid_orders?: number
          paid_orders_count?: number
          pending_orders?: number
          procurement_coverage_pct?: number
          procurement_outstanding?: number
          ready_to_pack_count?: number
          total_orders?: number
          total_packs?: number
          total_revenue?: number
          total_schools?: number
        }
        Update: {
          active_packs?: number
          awaiting_fulfilment?: number
          completed_orders?: number
          id?: string
          last_updated_at?: string
          orders_at_risk_count?: number
          orders_this_week?: number
          orders_today?: number
          paid_orders?: number
          paid_orders_count?: number
          pending_orders?: number
          procurement_coverage_pct?: number
          procurement_outstanding?: number
          ready_to_pack_count?: number
          total_orders?: number
          total_packs?: number
          total_revenue?: number
          total_schools?: number
        }
        Relationships: []
      }
      draft_carts: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          item_count: number
          items: Json
          status: string
          subtotal: number
          updated_at: string
          wants_pexcover: boolean
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          item_count?: number
          items?: Json
          status?: string
          subtotal?: number
          updated_at?: string
          wants_pexcover?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          item_count?: number
          items?: Json
          status?: string
          subtotal?: number
          updated_at?: string
          wants_pexcover?: boolean
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          links: Json
          question: string
          slug: string | null
          sort_order: number
          updated_at: string
          updated_by: string | null
          visible: boolean
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          links?: Json
          question: string
          slug?: string | null
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          visible?: boolean
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          links?: Json
          question?: string
          slug?: string | null
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          data: Json | null
          form_type: string
          id: string
          payload: Json
          source_url: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          form_type: string
          id?: string
          payload: Json
          source_url?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          form_type?: string
          id?: string
          payload?: Json
          source_url?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      fulfilment_records: {
        Row: {
          completed_at: string | null
          courier_name: string | null
          id: string
          method: string
          notes: string | null
          order_id: string
          school_open_day: string | null
          status: string
          target_date: string | null
          updated_at: string
          waybill_number: string | null
        }
        Insert: {
          completed_at?: string | null
          courier_name?: string | null
          id?: string
          method: string
          notes?: string | null
          order_id: string
          school_open_day?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
          waybill_number?: string | null
        }
        Update: {
          completed_at?: string | null
          courier_name?: string | null
          id?: string
          method?: string
          notes?: string | null
          order_id?: string
          school_open_day?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
          waybill_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fulfilment_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "order_readiness_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "fulfilment_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      learners: {
        Row: {
          created_at: string
          customer_id: string
          full_name: string
          grade: string | null
          id: string
          school_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          full_name: string
          grade?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          full_name?: string
          grade?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learners_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learners_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_school_directory_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learners_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_write_audit_log: {
        Row: {
          id: string
          operation: string
          payload: Json | null
          record_id: string | null
          table_name: string
          written_at: string
          written_by: string | null
        }
        Insert: {
          id?: string
          operation: string
          payload?: Json | null
          record_id?: string | null
          table_name: string
          written_at?: string
          written_by?: string | null
        }
        Update: {
          id?: string
          operation?: string
          payload?: Json | null
          record_id?: string | null
          table_name?: string
          written_at?: string
          written_by?: string | null
        }
        Relationships: []
      }
      master_products: {
        Row: {
          active: boolean
          availability: string
          brand: string | null
          calculated_selling_price: number | null
          category: string | null
          created_at: string
          created_by: string | null
          current_selling_price: number
          description: string | null
          icon: string | null
          id: string
          last_verified_at: string | null
          latest_verified_cost: number | null
          name: string
          packaging: string | null
          pexco_code: string | null
          preferred_supplier_id: string | null
          pricing_status: string
          requires_pexcover: boolean
          search_vector: unknown
          selling_price_override: number | null
          sku: string
          specification: string | null
          target_margin: number | null
          target_markup: number | null
          unit: string | null
          updated_at: string
          updated_by: string | null
          visibility: string
        }
        Insert: {
          active?: boolean
          availability?: string
          brand?: string | null
          calculated_selling_price?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          current_selling_price?: number
          description?: string | null
          icon?: string | null
          id?: string
          last_verified_at?: string | null
          latest_verified_cost?: number | null
          name: string
          packaging?: string | null
          pexco_code?: string | null
          preferred_supplier_id?: string | null
          pricing_status?: string
          requires_pexcover?: boolean
          search_vector?: unknown
          selling_price_override?: number | null
          sku: string
          specification?: string | null
          target_margin?: number | null
          target_markup?: number | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          visibility?: string
        }
        Update: {
          active?: boolean
          availability?: string
          brand?: string | null
          calculated_selling_price?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          current_selling_price?: number
          description?: string | null
          icon?: string | null
          id?: string
          last_verified_at?: string | null
          latest_verified_cost?: number | null
          name?: string
          packaging?: string | null
          pexco_code?: string | null
          preferred_supplier_id?: string | null
          pricing_status?: string
          requires_pexcover?: boolean
          search_vector?: unknown
          selling_price_override?: number | null
          sku?: string
          specification?: string | null
          target_margin?: number | null
          target_markup?: number | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_products_pexco_code_fkey"
            columns: ["pexco_code"]
            isOneToOne: false
            referencedRelation: "pexco_rates"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "master_products_preferred_supplier_id_fkey"
            columns: ["preferred_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          permission_key: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          permission_key?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          permission_key?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      operational_events: {
        Row: {
          actor_id: string | null
          created_at: string
          data: Json
          entity_id: string
          entity_type: string
          event_key: string | null
          event_type: string
          id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          data?: Json
          entity_id: string
          entity_type: string
          event_key?: string | null
          event_type: string
          id?: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          data?: Json
          entity_id?: string
          entity_type?: string
          event_key?: string | null
          event_type?: string
          id?: string
        }
        Relationships: []
      }
      operational_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_events: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          order_id: string
          payload: Json
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          order_id: string
          payload?: Json
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          order_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_readiness_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events_archive: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          archived_at: string
          created_at: string
          event_type: string
          id: string
          order_id: string
          payload: Json
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          archived_at?: string
          created_at?: string
          event_type: string
          id?: string
          order_id: string
          payload?: Json
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          archived_at?: string
          created_at?: string
          event_type?: string
          id?: string
          order_id?: string
          payload?: Json
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          description_snapshot: string | null
          estimated_unit_cost: number | null
          expected_margin: number | null
          grade_snapshot: string | null
          id: string
          line_total: number | null
          order_id: string
          pack_id: string | null
          pricing_version: string | null
          product_id: string | null
          product_name_snapshot: string
          quantity: number
          requires_pexcover: boolean
          school_name_snapshot: string | null
          sku_snapshot: string
          unit_selling_price: number
        }
        Insert: {
          created_at?: string
          description_snapshot?: string | null
          estimated_unit_cost?: number | null
          expected_margin?: number | null
          grade_snapshot?: string | null
          id?: string
          line_total?: number | null
          order_id: string
          pack_id?: string | null
          pricing_version?: string | null
          product_id?: string | null
          product_name_snapshot: string
          quantity: number
          requires_pexcover?: boolean
          school_name_snapshot?: string | null
          sku_snapshot: string
          unit_selling_price: number
        }
        Update: {
          created_at?: string
          description_snapshot?: string | null
          estimated_unit_cost?: number | null
          expected_margin?: number | null
          grade_snapshot?: string | null
          id?: string
          line_total?: number | null
          order_id?: string
          pack_id?: string | null
          pricing_version?: string | null
          product_id?: string | null
          product_name_snapshot?: string
          quantity?: number
          requires_pexcover?: boolean
          school_name_snapshot?: string | null
          sku_snapshot?: string
          unit_selling_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_readiness_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "admin_school_pack_health_mv"
            referencedColumns: ["pack_id"]
          },
          {
            foreignKeyName: "order_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "school_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_product_allocations: {
        Row: {
          allocated_at: string
          allocated_by: string | null
          id: string
          order_item_id: string
          purchase_item_id: string | null
          quantity: number
        }
        Insert: {
          allocated_at?: string
          allocated_by?: string | null
          id?: string
          order_item_id: string
          purchase_item_id?: string | null
          quantity: number
        }
        Update: {
          allocated_at?: string
          allocated_by?: string | null
          id?: string
          order_item_id?: string
          purchase_item_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_product_allocations_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_product_allocations_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_line_summary_view"
            referencedColumns: ["order_item_id"]
          },
          {
            foreignKeyName: "order_product_allocations_purchase_item_id_fkey"
            columns: ["purchase_item_id"]
            isOneToOne: false
            referencedRelation: "supplier_purchase_items"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          city: string | null
          commercial_snapshot_locked_at: string | null
          consent: boolean
          courier_name: string | null
          created_at: string
          customer_id: string | null
          delivery_address: Json | null
          delivery_type: string | null
          estimated_delivery: string | null
          estimated_total: number
          fulfilment_option: string | null
          gateway_reference: string | null
          grade: string
          id: string
          idempotency_key: string | null
          items: Json | null
          learner_id: string | null
          learner_name: string | null
          metadata: Json | null
          order_reference: string
          pack_type: string | null
          paid_at: string | null
          payment_gateway: string | null
          payment_reference: string | null
          pexcover_addon: boolean | null
          pexcover_data: Json | null
          pexcover_requested: boolean
          postal_code: string | null
          preferred_contact_method: string | null
          province: string | null
          receipt_email_claim_token: string | null
          receipt_email_last_error: string | null
          receipt_email_processing_at: string | null
          receipt_email_sent_at: string | null
          removed_items: Json | null
          school_name: string
          school_slug: string | null
          search_vector: unknown
          season_id: string | null
          sibling_group_id: string | null
          status: string
          street_address: string | null
          submission_id: string | null
          suburb: string | null
          tracking_token: string | null
          unique_customer_id: string | null
          updated_at: string
          waybill_number: string | null
        }
        Insert: {
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          city?: string | null
          commercial_snapshot_locked_at?: string | null
          consent?: boolean
          courier_name?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_type?: string | null
          estimated_delivery?: string | null
          estimated_total: number
          fulfilment_option?: string | null
          gateway_reference?: string | null
          grade: string
          id?: string
          idempotency_key?: string | null
          items?: Json | null
          learner_id?: string | null
          learner_name?: string | null
          metadata?: Json | null
          order_reference: string
          pack_type?: string | null
          paid_at?: string | null
          payment_gateway?: string | null
          payment_reference?: string | null
          pexcover_addon?: boolean | null
          pexcover_data?: Json | null
          pexcover_requested?: boolean
          postal_code?: string | null
          preferred_contact_method?: string | null
          province?: string | null
          receipt_email_claim_token?: string | null
          receipt_email_last_error?: string | null
          receipt_email_processing_at?: string | null
          receipt_email_sent_at?: string | null
          removed_items?: Json | null
          school_name: string
          school_slug?: string | null
          search_vector?: unknown
          season_id?: string | null
          sibling_group_id?: string | null
          status?: string
          street_address?: string | null
          submission_id?: string | null
          suburb?: string | null
          tracking_token?: string | null
          unique_customer_id?: string | null
          updated_at?: string
          waybill_number?: string | null
        }
        Update: {
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string
          city?: string | null
          commercial_snapshot_locked_at?: string | null
          consent?: boolean
          courier_name?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_type?: string | null
          estimated_delivery?: string | null
          estimated_total?: number
          fulfilment_option?: string | null
          gateway_reference?: string | null
          grade?: string
          id?: string
          idempotency_key?: string | null
          items?: Json | null
          learner_id?: string | null
          learner_name?: string | null
          metadata?: Json | null
          order_reference?: string
          pack_type?: string | null
          paid_at?: string | null
          payment_gateway?: string | null
          payment_reference?: string | null
          pexcover_addon?: boolean | null
          pexcover_data?: Json | null
          pexcover_requested?: boolean
          postal_code?: string | null
          preferred_contact_method?: string | null
          province?: string | null
          receipt_email_claim_token?: string | null
          receipt_email_last_error?: string | null
          receipt_email_processing_at?: string | null
          receipt_email_sent_at?: string | null
          removed_items?: Json | null
          school_name?: string
          school_slug?: string | null
          search_vector?: unknown
          season_id?: string | null
          sibling_group_id?: string | null
          status?: string
          street_address?: string | null
          submission_id?: string | null
          suburb?: string | null
          tracking_token?: string | null
          unique_customer_id?: string | null
          updated_at?: string
          waybill_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_events: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          pack_id: string
          payload: Json
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          pack_id: string
          payload?: Json
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          pack_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pack_events_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "admin_school_pack_health_mv"
            referencedColumns: ["pack_id"]
          },
          {
            foreignKeyName: "pack_events_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "school_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_records: {
        Row: {
          checked_at: string | null
          checked_by: string | null
          id: string
          notes: string | null
          order_id: string
          packed_at: string | null
          started_at: string | null
          started_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          checked_at?: string | null
          checked_by?: string | null
          id?: string
          notes?: string | null
          order_id: string
          packed_at?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          checked_at?: string | null
          checked_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          packed_at?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packing_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "order_readiness_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "packing_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          event_key: string
          gateway_reference: string | null
          id: string
          order_id: string
          payload: Json
          payment_method: string
          processed_at: string | null
          provider: string
          status: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string
          event_key: string
          gateway_reference?: string | null
          id?: string
          order_id: string
          payload?: Json
          payment_method?: string
          processed_at?: string | null
          provider?: string
          status: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string
          event_key?: string
          gateway_reference?: string | null
          id?: string
          order_id?: string
          payload?: Json
          payment_method?: string
          processed_at?: string | null
          provider?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_readiness_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payment_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway_reference: string | null
          id: string
          metadata: Json | null
          order_reference: string | null
          payment_gateway: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway_reference?: string | null
          id?: string
          metadata?: Json | null
          order_reference?: string | null
          payment_gateway?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway_reference?: string | null
          id?: string
          metadata?: Json | null
          order_reference?: string | null
          payment_gateway?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      pexco_rates: {
        Row: {
          code: string
          cost_price_cents: number | null
          covering_price_cents: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          cost_price_cents?: number | null
          covering_price_cents: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          cost_price_cents?: number | null
          covering_price_cents?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          approved_by: string | null
          changed_by: string | null
          created_at: string
          id: string
          new_cost: number | null
          new_margin: number | null
          new_selling_price: number | null
          previous_cost: number | null
          previous_margin: number | null
          previous_selling_price: number | null
          product_id: string
          reason: string | null
          source: string | null
          supplier_id: string | null
        }
        Insert: {
          approved_by?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_cost?: number | null
          new_margin?: number | null
          new_selling_price?: number | null
          previous_cost?: number | null
          previous_margin?: number | null
          previous_selling_price?: number | null
          product_id: string
          reason?: string | null
          source?: string | null
          supplier_id?: string | null
        }
        Update: {
          approved_by?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_cost?: number | null
          new_margin?: number | null
          new_selling_price?: number | null
          previous_cost?: number | null
          previous_margin?: number | null
          previous_selling_price?: number | null
          product_id?: string
          reason?: string | null
          source?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          method: string
          name: string
          priority: number
          rate: number
          rounding_increment: number
          scope: string
          scope_value: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          method: string
          name: string
          priority?: number
          rate: number
          rounding_increment?: number
          scope: string
          scope_value?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          method?: string
          name?: string
          priority?: number
          rate?: number
          rounding_increment?: number
          scope?: string
          scope_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      procurement_requirement_orders: {
        Row: {
          created_at: string
          id: string
          order_id: string
          order_item_id: string
          required_quantity: number
          requirement_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          order_item_id: string
          required_quantity: number
          requirement_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          order_item_id?: string
          required_quantity?: number
          requirement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "procurement_requirement_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_readiness_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "procurement_requirement_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requirement_orders_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: true
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requirement_orders_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: true
            referencedRelation: "order_line_summary_view"
            referencedColumns: ["order_item_id"]
          },
          {
            foreignKeyName: "procurement_requirement_orders_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "procurement_command_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requirement_orders_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "procurement_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_requirements: {
        Row: {
          allocated_quantity: number
          id: string
          product_id: string
          received_quantity: number
          requested_quantity: number
          required_quantity: number
          season_id: string
          secured_quantity: number
          status: string
          supplier_confirmed_quantity: number
          updated_at: string
        }
        Insert: {
          allocated_quantity?: number
          id?: string
          product_id: string
          received_quantity?: number
          requested_quantity?: number
          required_quantity?: number
          season_id?: string
          secured_quantity?: number
          status?: string
          supplier_confirmed_quantity?: number
          updated_at?: string
        }
        Update: {
          allocated_quantity?: number
          id?: string
          product_id?: string
          received_quantity?: number
          requested_quantity?: number
          required_quantity?: number
          season_id?: string
          secured_quantity?: number
          status?: string
          supplier_confirmed_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procurement_requirements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requirements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requirements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requirements_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          brand_id: string
          cost_price: number
          created_at: string
          id: string
          master_product_id: string
          selling_price: number
          sku: string
          supplier_id: string | null
          updated_at: string
          visible_on_catalogue: boolean
        }
        Insert: {
          brand_id: string
          cost_price?: number
          created_at?: string
          id?: string
          master_product_id: string
          selling_price?: number
          sku: string
          supplier_id?: string | null
          updated_at?: string
          visible_on_catalogue?: boolean
        }
        Update: {
          brand_id?: string
          cost_price?: number
          created_at?: string
          id?: string
          master_product_id?: string
          selling_price?: number
          sku?: string
          supplier_id?: string | null
          updated_at?: string
          visible_on_catalogue?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_events: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          quotation_id: string
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          quotation_id: string
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          quotation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_events_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          availability_snapshot: string | null
          cost_price: number | null
          created_at: string | null
          id: string
          item_title: string
          margin_amount: number | null
          margin_percent: number | null
          master_product_id: string | null
          quantity: number
          quotation_id: string
          sku: string | null
          sort_order: number
          supplier_snapshot: string | null
          total_price: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          availability_snapshot?: string | null
          cost_price?: number | null
          created_at?: string | null
          id?: string
          item_title: string
          margin_amount?: number | null
          margin_percent?: number | null
          master_product_id?: string | null
          quantity?: number
          quotation_id: string
          sku?: string | null
          sort_order?: number
          supplier_snapshot?: string | null
          total_price?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          availability_snapshot?: string | null
          cost_price?: number | null
          created_at?: string | null
          id?: string
          item_title?: string
          margin_amount?: number | null
          margin_percent?: number | null
          master_product_id?: string | null
          quantity?: number
          quotation_id?: string
          sku?: string | null
          sort_order?: number
          supplier_snapshot?: string | null
          total_price?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          converted_order_id: string | null
          created_at: string | null
          created_by: string | null
          delivery_fee: number
          discount_amount: number
          id: string
          notes: string | null
          pdf_generated_at: string | null
          pdf_status: string
          pdf_storage_path: string | null
          pdf_version: number
          quote_number: string
          recipient_email: string
          recipient_name: string
          recipient_phone: string | null
          school_id: string | null
          search_vector: unknown
          status: string
          subtotal: number
          total_amount: number
          updated_at: string | null
          valid_until: string
          vat_amount: number
          vat_enabled: boolean
          vat_rate: number
        }
        Insert: {
          converted_order_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_fee?: number
          discount_amount?: number
          id?: string
          notes?: string | null
          pdf_generated_at?: string | null
          pdf_status?: string
          pdf_storage_path?: string | null
          pdf_version?: number
          quote_number: string
          recipient_email: string
          recipient_name: string
          recipient_phone?: string | null
          school_id?: string | null
          search_vector?: unknown
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
          valid_until?: string
          vat_amount?: number
          vat_enabled?: boolean
          vat_rate?: number
        }
        Update: {
          converted_order_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_fee?: number
          discount_amount?: number
          id?: string
          notes?: string | null
          pdf_generated_at?: string | null
          pdf_status?: string
          pdf_storage_path?: string | null
          pdf_version?: number
          quote_number?: string
          recipient_email?: string
          recipient_name?: string
          recipient_phone?: string | null
          school_id?: string | null
          search_vector?: unknown
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
          valid_until?: string
          vat_amount?: number
          vat_enabled?: boolean
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotations_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "order_readiness_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "quotations_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_school_directory_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      school_pack_items: {
        Row: {
          active: boolean
          created_at: string
          id: string
          pack_id: string
          pack_quantity: number
          prescribed_brand: string | null
          product_id: string
          school_notes: string | null
          school_wording: string | null
          selling_price_override: number | null
          sort_order: number
          substitution_policy: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          pack_id: string
          pack_quantity?: number
          prescribed_brand?: string | null
          product_id: string
          school_notes?: string | null
          school_wording?: string | null
          selling_price_override?: number | null
          sort_order?: number
          substitution_policy?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          pack_id?: string
          pack_quantity?: number
          prescribed_brand?: string | null
          product_id?: string
          school_notes?: string | null
          school_wording?: string | null
          selling_price_override?: number | null
          sort_order?: number
          substitution_policy?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "admin_school_pack_health_mv"
            referencedColumns: ["pack_id"]
          },
          {
            foreignKeyName: "school_pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "school_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      school_packs: {
        Row: {
          academic_year: string | null
          assembly_cost: number
          calculated_selling_price: number
          created_at: string
          created_by: string | null
          delivery_type: string
          description: string | null
          featured: boolean
          freight_cost: number
          fulfilment_deadline: string | null
          id: string
          items_cost: number
          last_price_calculated_at: string | null
          list_version: number
          margin_rate_used: number
          other_cost: number
          pack_image: string | null
          packaging_cost: number
          price: number
          pricing_status: string
          publication_status: string | null
          published_at: string | null
          published_by: string | null
          school_id: string | null
          search_vector: unknown
          season_id: string | null
          slug: string | null
          sort_order: number
          stock: number
          title: string
          total_landed_cost: number
          updated_at: string
          updated_by: string | null
          version: number | null
          visible: boolean
        }
        Insert: {
          academic_year?: string | null
          assembly_cost?: number
          calculated_selling_price?: number
          created_at?: string
          created_by?: string | null
          delivery_type?: string
          description?: string | null
          featured?: boolean
          freight_cost?: number
          fulfilment_deadline?: string | null
          id?: string
          items_cost?: number
          last_price_calculated_at?: string | null
          list_version?: number
          margin_rate_used?: number
          other_cost?: number
          pack_image?: string | null
          packaging_cost?: number
          price?: number
          pricing_status?: string
          publication_status?: string | null
          published_at?: string | null
          published_by?: string | null
          school_id?: string | null
          search_vector?: unknown
          season_id?: string | null
          slug?: string | null
          sort_order?: number
          stock?: number
          title: string
          total_landed_cost?: number
          updated_at?: string
          updated_by?: string | null
          version?: number | null
          visible?: boolean
        }
        Update: {
          academic_year?: string | null
          assembly_cost?: number
          calculated_selling_price?: number
          created_at?: string
          created_by?: string | null
          delivery_type?: string
          description?: string | null
          featured?: boolean
          freight_cost?: number
          fulfilment_deadline?: string | null
          id?: string
          items_cost?: number
          last_price_calculated_at?: string | null
          list_version?: number
          margin_rate_used?: number
          other_cost?: number
          pack_image?: string | null
          packaging_cost?: number
          price?: number
          pricing_status?: string
          publication_status?: string | null
          published_at?: string | null
          published_by?: string | null
          school_id?: string | null
          search_vector?: unknown
          season_id?: string | null
          slug?: string | null
          sort_order?: number
          stock?: number
          title?: string
          total_landed_cost?: number
          updated_at?: string
          updated_by?: string | null
          version?: number | null
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "school_packs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_school_directory_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_packs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_packs_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          custom_badge: string | null
          description: string | null
          directory_status: string | null
          district: string | null
          email: string | null
          feature_status: string | null
          grades: Json | null
          id: string
          is_featured: boolean
          is_partner: boolean
          lat: number | null
          latitude: number | null
          lng: number | null
          location: unknown
          logo: string | null
          longitude: number | null
          lowest_price: number | null
          name: string
          parent_collection_accepted: boolean
          partner_since: string | null
          partnership: string | null
          principal: string | null
          province: string | null
          publication_status: string | null
          published: boolean
          refused_partnership: boolean
          search_vector: unknown
          slug: string
          stationery_list_status: string | null
          status: string
          telephone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          custom_badge?: string | null
          description?: string | null
          directory_status?: string | null
          district?: string | null
          email?: string | null
          feature_status?: string | null
          grades?: Json | null
          id?: string
          is_featured?: boolean
          is_partner?: boolean
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          location?: unknown
          logo?: string | null
          longitude?: number | null
          lowest_price?: number | null
          name: string
          parent_collection_accepted?: boolean
          partner_since?: string | null
          partnership?: string | null
          principal?: string | null
          province?: string | null
          publication_status?: string | null
          published?: boolean
          refused_partnership?: boolean
          search_vector?: unknown
          slug: string
          stationery_list_status?: string | null
          status?: string
          telephone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          custom_badge?: string | null
          description?: string | null
          directory_status?: string | null
          district?: string | null
          email?: string | null
          feature_status?: string | null
          grades?: Json | null
          id?: string
          is_featured?: boolean
          is_partner?: boolean
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          location?: unknown
          logo?: string | null
          longitude?: number | null
          lowest_price?: number | null
          name?: string
          parent_collection_accepted?: boolean
          partner_since?: string | null
          partnership?: string | null
          principal?: string | null
          province?: string | null
          publication_status?: string | null
          published?: boolean
          refused_partnership?: boolean
          search_vector?: unknown
          slug?: string
          stationery_list_status?: string | null
          status?: string
          telephone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      seasons: {
        Row: {
          academic_year: number
          created_at: string
          fulfilment_ends_on: string | null
          fulfilment_starts_on: string | null
          id: string
          is_default: boolean
          name: string
          ordering_closes_on: string | null
          starts_on: string | null
          status: string
          updated_at: string
        }
        Insert: {
          academic_year: number
          created_at?: string
          fulfilment_ends_on?: string | null
          fulfilment_starts_on?: string | null
          id?: string
          is_default?: boolean
          name: string
          ordering_closes_on?: string | null
          starts_on?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year?: number
          created_at?: string
          fulfilment_ends_on?: string | null
          fulfilment_starts_on?: string | null
          id?: string
          is_default?: boolean
          name?: string
          ordering_closes_on?: string | null
          starts_on?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          created_at: string
          email_masked: string | null
          event_type: string
          id: string
          ip_address: string
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_masked?: string | null
          event_type: string
          id?: string
          ip_address: string
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_masked?: string | null
          event_type?: string
          id?: string
          ip_address?: string
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_logs_archive: {
        Row: {
          archived_at: string
          created_at: string
          email_masked: string | null
          event_type: string
          id: string
          ip_address: string
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string
          created_at?: string
          email_masked?: string | null
          event_type: string
          id?: string
          ip_address: string
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string
          created_at?: string
          email_masked?: string | null
          event_type?: string
          id?: string
          ip_address?: string
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      substitutions: {
        Row: {
          approved_by: string | null
          created_at: string
          id: string
          order_item_id: string
          original_product_id: string | null
          quantity: number
          reason: string
          replacement_product_id: string
          requested_by: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          id?: string
          order_item_id: string
          original_product_id?: string | null
          quantity: number
          reason: string
          replacement_product_id: string
          requested_by?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          id?: string
          order_item_id?: string
          original_product_id?: string | null
          quantity?: number
          reason?: string
          replacement_product_id?: string
          requested_by?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "substitutions_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_line_summary_view"
            referencedColumns: ["order_item_id"]
          },
          {
            foreignKeyName: "substitutions_original_product_id_fkey"
            columns: ["original_product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_original_product_id_fkey"
            columns: ["original_product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_original_product_id_fkey"
            columns: ["original_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_replacement_product_id_fkey"
            columns: ["replacement_product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_replacement_product_id_fkey"
            columns: ["replacement_product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_replacement_product_id_fkey"
            columns: ["replacement_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_offers: {
        Row: {
          active: boolean
          available_quantity: number | null
          created_at: string
          currency: string
          id: string
          is_preferred: boolean
          lead_time_days: number | null
          minimum_order_quantity: number
          product_id: string
          quote_import_id: string | null
          supplier_id: string
          supplier_sku: string | null
          unit_cost: number
          updated_at: string
          valid_from: string
          valid_until: string | null
          verified_at: string | null
        }
        Insert: {
          active?: boolean
          available_quantity?: number | null
          created_at?: string
          currency?: string
          id?: string
          is_preferred?: boolean
          lead_time_days?: number | null
          minimum_order_quantity?: number
          product_id: string
          quote_import_id?: string | null
          supplier_id: string
          supplier_sku?: string | null
          unit_cost: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          verified_at?: string | null
        }
        Update: {
          active?: boolean
          available_quantity?: number | null
          created_at?: string
          currency?: string
          id?: string
          is_preferred?: boolean
          lead_time_days?: number | null
          minimum_order_quantity?: number
          product_id?: string
          quote_import_id?: string | null
          supplier_id?: string
          supplier_sku?: string | null
          unit_cost?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_offers_quote_import_id_fkey"
            columns: ["quote_import_id"]
            isOneToOne: false
            referencedRelation: "supplier_quote_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_offers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_purchase_items: {
        Row: {
          confirmed_quantity: number
          created_at: string
          id: string
          ordered_quantity: number
          product_id: string
          purchase_order_id: string
          received_quantity: number
          requirement_id: string | null
          unit_cost: number
        }
        Insert: {
          confirmed_quantity?: number
          created_at?: string
          id?: string
          ordered_quantity: number
          product_id: string
          purchase_order_id: string
          received_quantity?: number
          requirement_id?: string | null
          unit_cost: number
        }
        Update: {
          confirmed_quantity?: number
          created_at?: string
          id?: string
          ordered_quantity?: number
          product_id?: string
          purchase_order_id?: string
          received_quantity?: number
          requirement_id?: string | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_purchase_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "supplier_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_purchase_items_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "procurement_command_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_purchase_items_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "procurement_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_purchase_orders: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          expected_on: string | null
          id: string
          notes: string | null
          purchase_order_number: string
          season_id: string | null
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          expected_on?: string | null
          id?: string
          notes?: string | null
          purchase_order_number: string
          season_id?: string | null
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          expected_on?: string | null
          id?: string
          notes?: string | null
          purchase_order_number?: string
          season_id?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_purchase_orders_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_quote_imports: {
        Row: {
          completed_at: string | null
          created_at: string
          errors: Json
          id: string
          imported_by: string | null
          imported_rows: number
          rejected_rows: number
          source_file_name: string | null
          status: string
          storage_path: string | null
          supplier_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          errors?: Json
          id?: string
          imported_by?: string | null
          imported_rows?: number
          rejected_rows?: number
          source_file_name?: string | null
          status?: string
          storage_path?: string | null
          supplier_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          errors?: Json
          id?: string
          imported_by?: string | null
          imported_rows?: number
          rejected_rows?: number
          source_file_name?: string | null
          status?: string
          storage_path?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_quote_imports_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_receipts: {
        Row: {
          id: string
          notes: string | null
          purchase_order_id: string
          received_at: string
          received_by: string | null
          reference: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          purchase_order_id: string
          received_at?: string
          received_by?: string | null
          reference?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          purchase_order_id?: string
          received_at?: string
          received_by?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "supplier_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          address: string | null
          code: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          code: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          code?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          description: string
          is_public: boolean
          is_sensitive: boolean
          key: string
          requires_approval: boolean
          scope: Database["public"]["Enums"]["setting_scope"]
          scope_id: string | null
          updated_at: string
          updated_by: string | null
          value: Json
          value_type: Database["public"]["Enums"]["setting_value_type"]
          version: number
        }
        Insert: {
          category: string
          description: string
          is_public?: boolean
          is_sensitive?: boolean
          key: string
          requires_approval?: boolean
          scope?: Database["public"]["Enums"]["setting_scope"]
          scope_id?: string | null
          updated_at?: string
          updated_by?: string | null
          value: Json
          value_type?: Database["public"]["Enums"]["setting_value_type"]
          version?: number
        }
        Update: {
          category?: string
          description?: string
          is_public?: boolean
          is_sensitive?: boolean
          key?: string
          requires_approval?: boolean
          scope?: Database["public"]["Enums"]["setting_scope"]
          scope_id?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: Json
          value_type?: Database["public"]["Enums"]["setting_value_type"]
          version?: number
        }
        Relationships: []
      }
      system_settings_audit: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          change_reason: string | null
          created_at: string
          id: string
          new_value: Json
          old_value: Json | null
          setting_key: string
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          change_reason?: string | null
          created_at?: string
          id?: string
          new_value: Json
          old_value?: Json | null
          setting_key: string
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          change_reason?: string | null
          created_at?: string
          id?: string
          new_value?: Json
          old_value?: Json | null
          setting_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_audit_setting_key_fkey"
            columns: ["setting_key"]
            isOneToOne: false
            referencedRelation: "settings_effective_view"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "system_settings_audit_setting_key_fkey"
            columns: ["setting_key"]
            isOneToOne: false
            referencedRelation: "system_settings"
            referencedColumns: ["key"]
          },
        ]
      }
      task_comments: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "operational_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_mentions: {
        Row: {
          comment_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_mentions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "task_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar: string | null
          context: string
          created_at: string
          id: string
          name: string
          quote: string
          rating: number
          role: string
          sort_order: number
          updated_at: string
          updated_by: string | null
          visible: boolean
        }
        Insert: {
          avatar?: string | null
          context?: string
          created_at?: string
          id?: string
          name: string
          quote: string
          rating?: number
          role?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          visible?: boolean
        }
        Update: {
          avatar?: string | null
          context?: string
          created_at?: string
          id?: string
          name?: string
          quote?: string
          rating?: number
          role?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          granted: boolean
          permission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          permission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          display_name: string | null
          job_title: string | null
          telephone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          job_title?: string | null
          telephone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          job_title?: string | null
          telephone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      website_content: {
        Row: {
          created_at: string
          id: string
          key: string
          title: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      admin_data_quality_issues_view: {
        Row: {
          area: string | null
          issue: string | null
          issue_count: number | null
        }
        Relationships: []
      }
      admin_pack_items_view: {
        Row: {
          availability: string | null
          brand: string | null
          category: string | null
          description: string | null
          icon: string | null
          id: string | null
          name: string | null
          pack_id: string | null
          pexco_code: string | null
          pexco_rate_active: boolean | null
          pexco_rate_cents: number | null
          pexco_title: string | null
          product_id: string | null
          quantity: number | null
          requires_pexcover: boolean | null
          sku: string | null
          sort_order: number | null
          source: string | null
          specification: string | null
          substitution_policy: string | null
          unit_price: number | null
          visible: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "master_products_pexco_code_fkey"
            columns: ["pexco_code"]
            isOneToOne: false
            referencedRelation: "pexco_rates"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "school_pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "admin_school_pack_health_mv"
            referencedColumns: ["pack_id"]
          },
          {
            foreignKeyName: "school_pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "school_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_product_margin_mv: {
        Row: {
          availability: string | null
          brand: string | null
          category: string | null
          estimated_cost: number | null
          gross_margin_percent: number | null
          id: string | null
          name: string | null
          pricing_status: string | null
          selling_price: number | null
          sku: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      admin_quote_pipeline_mv: {
        Row: {
          avg_value: number | null
          month: string | null
          quotes_count: number | null
          status: string | null
          total_value: number | null
        }
        Relationships: []
      }
      admin_school_pack_health_mv: {
        Row: {
          active_items: number | null
          hidden_products: number | null
          item_subtotal: number | null
          missing_products: number | null
          pack_id: string | null
          price: number | null
          school_id: string | null
          school_name: string | null
          slug: string | null
          title: string | null
          visible: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "school_packs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_school_directory_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_packs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_supplier_demand_mv: {
        Row: {
          expected_margin: number | null
          ordered_units: number | null
          ordered_value: number | null
          products_count: number | null
          supplier_id: string | null
          supplier_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_products_preferred_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      canonical_pack_items_view: {
        Row: {
          availability: string | null
          brand: string | null
          category: string | null
          description: string | null
          icon: string | null
          id: string | null
          name: string | null
          pack_id: string | null
          pexco_code: string | null
          pexco_rate_active: boolean | null
          pexco_rate_cents: number | null
          pexco_title: string | null
          product_id: string | null
          quantity: number | null
          requires_pexcover: boolean | null
          sku: string | null
          sort_order: number | null
          source: string | null
          specification: string | null
          substitution_policy: string | null
          unit_price: number | null
          visible: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "master_products_pexco_code_fkey"
            columns: ["pexco_code"]
            isOneToOne: false
            referencedRelation: "pexco_rates"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "school_pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "admin_school_pack_health_mv"
            referencedColumns: ["pack_id"]
          },
          {
            foreignKeyName: "school_pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "school_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_line_summary_view: {
        Row: {
          description: string | null
          estimated_unit_cost: number | null
          expected_margin: number | null
          grade_snapshot: string | null
          line_total: number | null
          order_created_at: string | null
          order_id: string | null
          order_item_id: string | null
          order_reference: string | null
          order_status: string | null
          pack_id: string | null
          paid_at: string | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          school_name_snapshot: string | null
          sku: string | null
          unit_selling_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_readiness_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "admin_school_pack_health_mv"
            referencedColumns: ["pack_id"]
          },
          {
            foreignKeyName: "order_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "school_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_readiness_view: {
        Row: {
          allocated_units: number | null
          line_count: number | null
          order_id: string | null
          order_reference: string | null
          order_status: string | null
          readiness_percent: number | null
          required_units: number | null
        }
        Relationships: []
      }
      pack_subtotals: {
        Row: {
          item_count: number | null
          school_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_packs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_school_directory_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_packs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_command_view: {
        Row: {
          allocated_quantity: number | null
          category: string | null
          id: string | null
          outstanding_quantity: number | null
          procurement_coverage_percent: number | null
          product_id: string | null
          product_name: string | null
          received_quantity: number | null
          requested_quantity: number | null
          required_quantity: number | null
          season_id: string | null
          secured_quantity: number | null
          sku: string | null
          status: string | null
          supplier_confirmed_quantity: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procurement_requirements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requirements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requirements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requirements_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          availability: string | null
          brand: string | null
          calculated_selling_price: number | null
          category: string | null
          created_at: string | null
          created_by: string | null
          current_selling_price: number | null
          description: string | null
          icon: string | null
          id: string | null
          last_verified_at: string | null
          latest_verified_cost: number | null
          name: string | null
          packaging: string | null
          pexco_code: string | null
          preferred_supplier_id: string | null
          pricing_status: string | null
          requires_pexcover: boolean | null
          search_vector: unknown
          selling_price_override: number | null
          sku: string | null
          specification: string | null
          target_margin: number | null
          target_markup: number | null
          unit: string | null
          updated_at: string | null
          updated_by: string | null
          visibility: string | null
        }
        Insert: {
          active?: boolean | null
          availability?: string | null
          brand?: string | null
          calculated_selling_price?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          current_selling_price?: number | null
          description?: string | null
          icon?: string | null
          id?: string | null
          last_verified_at?: string | null
          latest_verified_cost?: number | null
          name?: string | null
          packaging?: string | null
          pexco_code?: string | null
          preferred_supplier_id?: string | null
          pricing_status?: string | null
          requires_pexcover?: boolean | null
          search_vector?: unknown
          selling_price_override?: number | null
          sku?: string | null
          specification?: string | null
          target_margin?: number | null
          target_markup?: number | null
          unit?: string | null
          updated_at?: string | null
          updated_by?: string | null
          visibility?: string | null
        }
        Update: {
          active?: boolean | null
          availability?: string | null
          brand?: string | null
          calculated_selling_price?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          current_selling_price?: number | null
          description?: string | null
          icon?: string | null
          id?: string | null
          last_verified_at?: string | null
          latest_verified_cost?: number | null
          name?: string | null
          packaging?: string | null
          pexco_code?: string | null
          preferred_supplier_id?: string | null
          pricing_status?: string | null
          requires_pexcover?: boolean | null
          search_vector?: unknown
          selling_price_override?: number | null
          sku?: string | null
          specification?: string | null
          target_margin?: number | null
          target_markup?: number | null
          unit?: string | null
          updated_at?: string | null
          updated_by?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_products_pexco_code_fkey"
            columns: ["pexco_code"]
            isOneToOne: false
            referencedRelation: "pexco_rates"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "master_products_preferred_supplier_id_fkey"
            columns: ["preferred_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      public_pack_items_view: {
        Row: {
          availability: string | null
          brand: string | null
          category: string | null
          description: string | null
          icon: string | null
          id: string | null
          name: string | null
          pack_id: string | null
          pexco_code: string | null
          pexco_rate_active: boolean | null
          pexco_rate_cents: number | null
          pexco_title: string | null
          product_id: string | null
          quantity: number | null
          requires_pexcover: boolean | null
          sku: string | null
          sort_order: number | null
          source: string | null
          specification: string | null
          substitution_policy: string | null
          unit_price: number | null
          visible: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "master_products_pexco_code_fkey"
            columns: ["pexco_code"]
            isOneToOne: false
            referencedRelation: "pexco_rates"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "school_pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "admin_school_pack_health_mv"
            referencedColumns: ["pack_id"]
          },
          {
            foreignKeyName: "school_pack_items_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "school_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "admin_product_margin_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      public_school_directory_view: {
        Row: {
          city: string | null
          created_at: string | null
          custom_badge: string | null
          directory_status: string | null
          district: string | null
          feature_status: string | null
          grades: Json | null
          id: string | null
          is_featured: boolean | null
          is_partner: boolean | null
          latitude: number | null
          logo: string | null
          longitude: number | null
          lowest_price: number | null
          name: string | null
          parent_collection_accepted: boolean | null
          partner_since: string | null
          partnership: string | null
          principal: string | null
          province: string | null
          publication_status: string | null
          published: boolean | null
          refused_partnership: boolean | null
          slug: string | null
          stationery_list_status: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          custom_badge?: string | null
          directory_status?: string | null
          district?: string | null
          feature_status?: string | null
          grades?: Json | null
          id?: string | null
          is_featured?: never
          is_partner?: never
          latitude?: number | null
          logo?: string | null
          longitude?: number | null
          lowest_price?: number | null
          name?: string | null
          parent_collection_accepted?: boolean | null
          partner_since?: string | null
          partnership?: string | null
          principal?: string | null
          province?: string | null
          publication_status?: string | null
          published?: never
          refused_partnership?: never
          slug?: string | null
          stationery_list_status?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          custom_badge?: string | null
          directory_status?: string | null
          district?: string | null
          feature_status?: string | null
          grades?: Json | null
          id?: string | null
          is_featured?: never
          is_partner?: never
          latitude?: number | null
          logo?: string | null
          longitude?: number | null
          lowest_price?: number | null
          name?: string | null
          parent_collection_accepted?: boolean | null
          partner_since?: string | null
          partnership?: string | null
          principal?: string | null
          province?: string | null
          publication_status?: string | null
          published?: never
          refused_partnership?: never
          slug?: string | null
          stationery_list_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settings_effective_view: {
        Row: {
          category: string | null
          is_public: boolean | null
          is_sensitive: boolean | null
          key: string | null
          requires_approval: boolean | null
          scope: string | null
          scope_id: string | null
          source: string | null
          updated_at: string | null
          value: Json | null
          value_type: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          is_public?: boolean | null
          is_sensitive?: boolean | null
          key?: string | null
          requires_approval?: boolean | null
          scope?: never
          scope_id?: string | null
          source?: never
          updated_at?: string | null
          value?: Json | null
          value_type?: never
          version?: number | null
        }
        Update: {
          category?: string | null
          is_public?: boolean | null
          is_sensitive?: boolean | null
          key?: string | null
          requires_approval?: boolean | null
          scope?: never
          scope_id?: string | null
          source?: never
          updated_at?: string | null
          value?: Json | null
          value_type?: never
          version?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_global_omnibar_search: {
        Args: { max_results?: number; search_query: string }
        Returns: Json
      }
      admin_orders_dashboard: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_packs_dashboard: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_school_id?: string
          p_search?: string
          p_visible?: boolean
        }
        Returns: Json
      }
      admin_quotations_dashboard: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_status?: string
        }
        Returns: Json
      }
      allocate_secured_demand: {
        Args: { p_requirement_id: string }
        Returns: number
      }
      archive_operational_history: {
        Args: { dry_run?: boolean; retention_days?: number }
        Returns: Json
      }
      auto_expire_quotations: { Args: never; Returns: number }
      calculate_grade_pack_price: { Args: { p_pack_id: string }; Returns: Json }
      claim_order_receipt_delivery: {
        Args: { p_order_id: string }
        Returns: string
      }
      complete_order_payment: {
        Args: {
          p_amount: number
          p_currency?: string
          p_gateway_reference: string
          p_order_reference: string
          p_payload?: Json
          p_payment_method?: string
          p_provider?: string
        }
        Returns: Json
      }
      complete_order_receipt_delivery: {
        Args: {
          p_claim_token: string
          p_error?: string
          p_order_id: string
          p_sent: boolean
        }
        Returns: undefined
      }
      convert_quotation_to_order: { Args: { p_payload: Json }; Returns: Json }
      create_pending_order_with_snapshots: {
        Args: { p_order: Json; p_snapshots: Json }
        Returns: Json
      }
      create_quotation_with_items: { Args: { p_payload: Json }; Returns: Json }
      current_operational_season_id: { Args: never; Returns: string }
      explain_public_read_paths: {
        Args: { school_slug?: string; search_query?: string }
        Returns: Json
      }
      get_admin_executive_dashboard: { Args: never; Returns: Json }
      get_admin_filter_options: { Args: never; Returns: Json }
      get_admin_procurement_forecast: { Args: never; Returns: Json }
      get_all_pack_school_groups_json: {
        Args: { q?: string; visible_filter?: string }
        Returns: Json
      }
      get_assets_size: {
        Args: never
        Returns: {
          size_bytes: number
        }[]
      }
      get_database_storage_metrics: {
        Args: never
        Returns: {
          dead_rows: number
          index_bytes: number
          live_rows: number
          table_bytes: number
          table_name: string
          total_bytes: number
        }[]
      }
      get_featured_public_schools: {
        Args: { result_limit?: number }
        Returns: {
          city: string
          custom_badge: string
          district: string
          grades: Json
          id: string
          is_featured: boolean
          is_partner: boolean
          logo: string
          lowest_price: number
          name: string
          province: string
          slug: string
        }[]
      }
      get_order_pack_types: {
        Args: never
        Returns: {
          pack_type: string
        }[]
      }
      get_orders_by_pack_type: {
        Args: never
        Returns: {
          order_count: number
          pack_type: string
        }[]
      }
      get_orders_daily: {
        Args: { from_date: string; to_date: string }
        Returns: {
          day: string
          order_count: number
          revenue: number
        }[]
      }
      get_pack_subtotal: { Args: { pack_id: string }; Returns: number }
      get_payment_totals: {
        Args: {
          from_ts?: string
          q?: string
          status_filter?: string
          to_ts?: string
        }
        Returns: {
          paid_count: number
          paid_total: number
        }[]
      }
      get_public_cms_announcements: {
        Args: { p_location?: string }
        Returns: {
          badge_text: string
          display_location: string
          id: string
          link_label: string
          link_url: string
          message: string
        }[]
      }
      get_public_cms_faqs: {
        Args: { p_page?: string }
        Returns: {
          answer: string
          category: string
          id: string
          question: string
          sort_order: number
          target_page: string
        }[]
      }
      get_public_cms_resources: {
        Args: never
        Returns: {
          author: string
          category: string
          content: Json
          description: string
          download_count: number
          file_size_label: string
          file_type: string
          file_url: string
          id: string
          image: string
          kind: string
          published_at: string
          slug: string
          sort_order: number
          title: string
        }[]
      }
      get_public_cms_testimonials: {
        Args: never
        Returns: {
          author_name: string
          author_role: string
          avatar_url: string
          id: string
          quote: string
          rating: number
          school_id: string
          school_name: string
        }[]
      }
      get_public_featured_schools: {
        Args: { limit_count?: number }
        Returns: {
          canonical_pack_item_count: number
          city: string
          custom_badge: string
          district: string
          grades: Json
          id: string
          is_featured: boolean
          is_partner: boolean
          logo: string
          lowest_price: number
          name: string
          partnership: string
          province: string
          slug: string
        }[]
      }
      get_public_nearby_schools: {
        Args: { result_limit?: number; user_lat: number; user_lng: number }
        Returns: {
          canonical_pack_item_count: number
          city: string
          custom_badge: string
          district: string
          grades: Json
          id: string
          is_featured: boolean
          is_partner: boolean
          latitude: number
          logo: string
          longitude: number
          lowest_price: number
          name: string
          partnership: string
          province: string
          slug: string
        }[]
      }
      get_public_school_pack: { Args: { school_slug: string }; Returns: Json }
      get_public_school_visibility: {
        Args: { school_slugs?: string[] }
        Returns: {
          parent_collection_accepted: boolean
          slug: string
        }[]
      }
      get_public_website_content: {
        Args: never
        Returns: {
          key: string
          value: Json
        }[]
      }
      get_revenue_total: {
        Args: never
        Returns: {
          revenue: number
        }[]
      }
      get_schools_by_city: {
        Args: never
        Returns: {
          city: string
          school_count: number
        }[]
      }
      get_schools_by_district: {
        Args: { limit_count?: number; target_district: string }
        Returns: {
          city: string
          id: string
          is_featured: boolean
          is_partner: boolean
          logo: string
          lowest_price: number
          name: string
          province: string
          slug: string
        }[]
      }
      get_schools_near_user: {
        Args: {
          limit_count?: number
          radius_meters?: number
          user_lat: number
          user_lng: number
        }
        Returns: {
          city: string
          distance_km: number
          id: string
          is_featured: boolean
          is_partner: boolean
          logo: string
          lowest_price: number
          name: string
          province: string
          slug: string
        }[]
      }
      grant_role: {
        Args: { granted_by?: string; role_slug: string; target_user_id: string }
        Returns: undefined
      }
      has_permission: { Args: { p_key: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      match_stationery_product:
        | {
            Args: {
              match_limit?: number
              match_threshold?: number
              query_text: string
            }
            Returns: {
              brand: string
              category: string
              current_selling_price: number
              id: string
              name: string
              pexco_code: string
              requires_pexcover: boolean
              similarity: number
              sku: string
            }[]
          }
        | {
            Args: {
              match_limit?: number
              match_threshold?: number
              query_text: string
            }
            Returns: {
              category: string
              current_selling_price: number
              id: string
              name: string
              pexco_code: string
              requires_pexcover: boolean
              similarity: number
              sku: string
            }[]
          }
      next_quotation_number: { Args: never; Returns: string }
      publish_school_pack: {
        Args: { p_pack_id: string; p_user_id?: string }
        Returns: Json
      }
      recalculate_all_grade_pack_prices: { Args: never; Returns: Json }
      recalculate_grade_pack_price: {
        Args: { p_pack_id: string }
        Returns: Json
      }
      recalculate_quotation_totals: {
        Args: { p_quotation_id: string }
        Returns: undefined
      }
      record_order_payment_status: {
        Args: {
          p_amount: number
          p_currency?: string
          p_gateway_reference: string
          p_order_reference: string
          p_payload?: Json
          p_status: string
        }
        Returns: Json
      }
      refresh_admin_operational_summaries: { Args: never; Returns: undefined }
      refresh_all_dashboard_summaries: { Args: never; Returns: undefined }
      revoke_role: {
        Args: { role_slug: string; target_user_id: string }
        Returns: undefined
      }
      run_admin_data_quality_audit: {
        Args: never
        Returns: {
          area: string
          issue: string
          issue_count: number
        }[]
      }
      school_search_query: { Args: { input: string }; Returns: unknown }
      search_public_schools: {
        Args: {
          grade_filter?: string
          phase_filter?: string
          region_filter?: string
          result_limit?: number
          result_offset?: number
          search_query?: string
        }
        Returns: {
          city: string
          custom_badge: string
          district: string
          grades: Json
          id: string
          is_featured: boolean
          is_partner: boolean
          logo: string
          lowest_price: number
          name: string
          province: string
          slug: string
          total_count: number
        }[]
      }
      set_user_as_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      set_user_permission: {
        Args: {
          granted: boolean
          granted_by?: string
          permission_key: string
          target_user_id: string
        }
        Returns: undefined
      }
      validate_pack_for_publication: {
        Args: { p_pack_id: string }
        Returns: Json
      }
    }
    Enums: {
      setting_scope: "global" | "season" | "school" | "category" | "product"
      setting_value_type:
        | "string"
        | "number"
        | "boolean"
        | "json"
        | "email"
        | "percentage"
        | "currency"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      setting_scope: ["global", "season", "school", "category", "product"],
      setting_value_type: [
        "string",
        "number",
        "boolean",
        "json",
        "email",
        "percentage",
        "currency",
      ],
    },
  },
} as const
