export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      form_submissions: {
        Row: {
          id: string;
          form_type: string;
          status: string;
          payload: Json;
          data?: Json;
          source_url?: string | null;
          user_agent?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_type: string;
          status?: string;
          payload?: Json;
          data?: Json;
          source_url?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_type?: string;
          status?: string;
          payload?: Json;
          data?: Json;
          source_url?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          submission_id: string | null;
          order_reference: string;
          school_slug: string | null;
          school_name: string;
          grade: string;
          pack_type: string;
          items: Json | null;
          removed_items: Json | null;
          estimated_total: number | null;
          pexcover_requested: boolean;
          pexcover_data: Json | null;
          fulfilment_option: string | null;
          delivery_address: Json | null;
          buyer_name: string;
          buyer_phone: string;
          buyer_email: string | null;
          learner_name: string | null;
          consent: boolean;
          sibling_group_id: string | null;
          status: string;
          paid_at: string | null;
          payment_gateway: string | null;
          gateway_reference: string | null;
          metadata: Json | null;
          preferred_contact_method: string | null;
          delivery_type: string | null;
          pexcover_addon: boolean;
          payment_reference: string | null;
          street_address: string | null;
          suburb: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          submission_id?: string | null;
          order_reference: string;
          school_slug?: string | null;
          school_name: string;
          grade: string;
          pack_type?: string;
          items?: Json | null;
          removed_items?: Json | null;
          estimated_total?: number | null;
          pexcover_requested?: boolean;
          pexcover_data?: Json | null;
          fulfilment_option?: string | null;
          delivery_address?: Json | null;
          buyer_name: string;
          buyer_phone: string;
          buyer_email?: string | null;
          learner_name?: string | null;
          consent?: boolean;
          sibling_group_id?: string | null;
          status?: string;
          paid_at?: string | null;
          payment_gateway?: string | null;
          gateway_reference?: string | null;
          metadata?: Json | null;
          preferred_contact_method?: string | null;
          delivery_type?: string | null;
          pexcover_addon?: boolean;
          payment_reference?: string | null;
          street_address?: string | null;
          suburb?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string | null;
          order_reference?: string;
          school_slug?: string | null;
          school_name?: string;
          grade?: string;
          pack_type?: string;
          items?: Json | null;
          removed_items?: Json | null;
          estimated_total?: number | null;
          pexcover_requested?: boolean;
          pexcover_data?: Json | null;
          fulfilment_option?: string | null;
          delivery_address?: Json | null;
          buyer_name?: string;
          buyer_phone?: string;
          buyer_email?: string | null;
          learner_name?: string | null;
          consent?: boolean;
          sibling_group_id?: string | null;
          status?: string;
          paid_at?: string | null;
          payment_gateway?: string | null;
          gateway_reference?: string | null;
          metadata?: Json | null;
          preferred_contact_method?: string | null;
          delivery_type?: string | null;
          pexcover_addon?: boolean;
          payment_reference?: string | null;
          street_address?: string | null;
          suburb?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "form_submissions";
            referencedColumns: ["id"];
          }
        ];
      };
      lay_by_applications: {
        Row: {
          id: string;
          submission_id: string | null;
          applicant_name: string;
          id_number: string;
          phone: string;
          email: string | null;
          residential_address: string;
          learner_name: string;
          school_name: string;
          grade: string;
          pack_name: string;
          pexcover_requested: boolean;
          delivery_preference: string | null;
          estimated_total: number | null;
          deposit_amount: number | null;
          payment_term_months: number | null;
          debit_date_preference: string | null;
          notes: string | null;
          signature_name: string;
          signature_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          submission_id?: string | null;
          applicant_name: string;
          id_number: string;
          phone: string;
          email?: string | null;
          residential_address: string;
          learner_name: string;
          school_name: string;
          grade: string;
          pack_name: string;
          pexcover_requested?: boolean;
          delivery_preference?: string | null;
          estimated_total?: number | null;
          deposit_amount?: number | null;
          payment_term_months?: number | null;
          debit_date_preference?: string | null;
          notes?: string | null;
          signature_name: string;
          signature_date: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string | null;
          applicant_name?: string;
          id_number?: string;
          phone?: string;
          email?: string | null;
          residential_address?: string;
          learner_name?: string;
          school_name?: string;
          grade?: string;
          pack_name?: string;
          pexcover_requested?: boolean;
          delivery_preference?: string | null;
          estimated_total?: number | null;
          deposit_amount?: number | null;
          payment_term_months?: number | null;
          debit_date_preference?: string | null;
          notes?: string | null;
          signature_name?: string;
          signature_date?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lay_by_applications_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "form_submissions";
            referencedColumns: ["id"];
          }
        ];
      };
      waitlist_entries: {
        Row: {
          id: string;
          school_name: string;
          email: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_name: string;
          email: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_name?: string;
          email?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      brand_package_claims: {
        Row: {
          id: string;
          submission_id: string | null;
          business_name: string;
          applicant_name: string;
          phone: string;
          email: string;
          website: string | null;
          business_description: string;
          branding_preferences: string;
          existing_branding: string | null;
          target_audience: string | null;
          deadline: string | null;
          notes: string | null;
          consent: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          submission_id?: string | null;
          business_name: string;
          applicant_name: string;
          phone: string;
          email: string;
          website?: string | null;
          business_description: string;
          branding_preferences: string;
          existing_branding?: string | null;
          target_audience?: string | null;
          deadline?: string | null;
          notes?: string | null;
          consent?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string | null;
          business_name?: string;
          applicant_name?: string;
          phone?: string;
          email?: string;
          website?: string | null;
          business_description?: string;
          branding_preferences?: string;
          existing_branding?: string | null;
          target_audience?: string | null;
          deadline?: string | null;
          notes?: string | null;
          consent?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brand_package_claims_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "form_submissions";
            referencedColumns: ["id"];
          }
        ];
      };
      brand_package_assets: {
        Row: {
          id: string;
          claim_id: string;
          file_path: string;
          file_name: string;
          file_size: number | null;
          content_type: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          claim_id: string;
          file_path: string;
          file_name: string;
          file_size?: number | null;
          content_type?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          claim_id?: string;
          file_path?: string;
          file_name?: string;
          file_size?: number | null;
          content_type?: string | null;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brand_package_assets_claim_id_fkey";
            columns: ["claim_id"];
            isOneToOne: false;
            referencedRelation: "brand_package_claims";
            referencedColumns: ["id"];
          }
        ];
      };
      schools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          city: string | null;
          province: string | null;
          logo: string | null;
          is_partner: boolean;
          is_featured: boolean;
          lowest_price: number | null;
          grades: Json | null;
          district: string | null;
          address: string | null;
          email: string | null;
          telephone: string | null;
          principal: string | null;
          description: string | null;
          status: string;
          partner_since: string | null;
          latitude: number | null;
          longitude: number | null;
          published: boolean;
          search_vector: string | null;
          custom_badge: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          city?: string | null;
          province?: string | null;
          logo?: string | null;
          is_partner?: boolean;
          is_featured?: boolean;
          lowest_price?: number | null;
          grades?: Json | null;
          district?: string | null;
          address?: string | null;
          email?: string | null;
          telephone?: string | null;
          principal?: string | null;
          description?: string | null;
          status?: string;
          partner_since?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          published?: boolean;
          updated_by?: string | null;
          custom_badge?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          city?: string | null;
          province?: string | null;
          logo?: string | null;
          is_partner?: boolean;
          is_featured?: boolean;
          lowest_price?: number | null;
          grades?: Json | null;
          district?: string | null;
          address?: string | null;
          email?: string | null;
          telephone?: string | null;
          principal?: string | null;
          description?: string | null;
          status?: string;
          partner_since?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          published?: boolean;
          updated_by?: string | null;
          custom_badge?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          key: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          user_id: string;
          role_id: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role_id: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role_id?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_permissions: {
        Row: {
          user_id: string;
          permission_id: string;
          granted: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          permission_id: string;
          granted?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          permission_id?: string;
          granted?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          }
        ];
      };
      assigned_forms: {
        Row: {
          id: string;
          user_id: string;
          form_key: string;
          label: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          form_key: string;
          label: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          form_key?: string;
          label?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      website_content: {
        Row: {
          id: string;
          key: string;
          title: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          title?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          title?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string;
          context: string;
          quote: string;
          avatar: string | null;
          rating: number;
          visible: boolean;
          sort_order: number;
          updated_by: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role?: string;
          context?: string;
          quote: string;
          avatar?: string | null;
          rating?: number;
          visible?: boolean;
          sort_order?: number;
          updated_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          context?: string;
          quote?: string;
          avatar?: string | null;
          rating?: number;
          visible?: boolean;
          sort_order?: number;
          updated_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          slug: string | null;
          question: string;
          answer: string;
          category: string;
          links: Json;
          visible: boolean;
          sort_order: number;
          updated_by: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug?: string | null;
          question: string;
          answer: string;
          category?: string;
          links?: Json;
          visible?: boolean;
          sort_order?: number;
          updated_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string | null;
          question?: string;
          answer?: string;
          category?: string;
          links?: Json;
          visible?: boolean;
          sort_order?: number;
          updated_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      assets: {
        Row: {
          id: string;
          name: string;
          bucket: string;
          folder: string;
          path: string;
          public_url: string | null;
          mime_type: string | null;
          size_bytes: number;
          width: number | null;
          height: number | null;
          alt_text: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bucket?: string;
          folder?: string;
          path: string;
          public_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bucket?: string;
          folder?: string;
          path?: string;
          public_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: number;
          created_at: string;
          actor_id: string | null;
          actor_name: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          summary: string;
          details: Json | null;
          ip: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          actor_id?: string | null;
          actor_name?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          summary: string;
          details?: Json | null;
          ip?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          actor_id?: string | null;
          actor_name?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          summary?: string;
          details?: Json | null;
          ip?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      stationery_packs: {
        Row: {
          id: string;
          school_id: string | null;
          title: string;
          slug: string | null;
          description: string | null;
          price: number;
          stock: number;
          featured: boolean;
          visible: boolean;
          academic_year: string | null;
          delivery_type: string;
          pack_image: string | null;
          sort_order: number;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          search_vector: string | null;
        };
        Insert: {
          id?: string;
          school_id?: string | null;
          title: string;
          slug?: string | null;
          description?: string | null;
          price?: number;
          stock?: number;
          featured?: boolean;
          visible?: boolean;
          academic_year?: string | null;
          delivery_type?: string;
          pack_image?: string | null;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          search_vector?: string | null;
        };
        Update: {
          id?: string;
          school_id?: string | null;
          title?: string;
          slug?: string | null;
          description?: string | null;
          price?: number;
          stock?: number;
          featured?: boolean;
          visible?: boolean;
          academic_year?: string | null;
          delivery_type?: string;
          pack_image?: string | null;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          search_vector?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stationery_packs_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          }
        ];
      };
      stationery_items: {
        Row: {
          id: string;
          pack_id: string;
          name: string;
          description: string | null;
          quantity: number;
          unit_price: number | null;
          image: string | null;
          visible: boolean;
          sort_order: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          search_vector: string | null;
        };
        Insert: {
          id?: string;
          pack_id: string;
          name: string;
          description?: string | null;
          quantity?: number;
          unit_price?: number | null;
          image?: string | null;
          visible?: boolean;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          search_vector?: string | null;
        };
        Update: {
          id?: string;
          pack_id?: string;
          name?: string;
          description?: string | null;
          quantity?: number;
          unit_price?: number | null;
          image?: string | null;
          visible?: boolean;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          search_vector?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stationery_items_pack_id_fkey";
            columns: ["pack_id"];
            isOneToOne: false;
            referencedRelation: "stationery_packs";
            referencedColumns: ["id"];
          }
        ];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: Json | null;
          author: string | null;
          category: string | null;
          image: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content?: Json | null;
          author?: string | null;
          category?: string | null;
          image?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string | null;
          content?: Json | null;
          author?: string | null;
          category?: string | null;
          image?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      has_permission: { Args: { p_key: string }; Returns: boolean };
      set_user_as_admin: { Args: { target_user_id: string }; Returns: undefined };
      grant_role: {
        Args: { target_user_id: string; role_slug: string; granted_by?: string | null };
        Returns: undefined;
      };
      revoke_role: { Args: { target_user_id: string; role_slug: string }; Returns: undefined };
      set_user_permission: {
        Args: { target_user_id: string; permission_key: string; granted: boolean; granted_by?: string | null };
        Returns: undefined;
      };
      get_orders_daily: {
        Args: { from_date: string; to_date: string };
        Returns: { day: string; order_count: number; revenue: number }[];
      };
      get_orders_by_pack_type: {
        Args: Record<string, never>;
        Returns: { pack_type: string; order_count: number }[];
      };
      get_schools_by_city: {
        Args: Record<string, never>;
        Returns: { city: string | null; school_count: number }[];
      };
      get_orders_summary: {
        Args: { from_date: string; to_date: string };
        Returns: {
          total_orders: number;
          paid_orders: number;
          refunded_orders: number;
          cancelled_orders: number;
          revenue: number;
          avg_order_value: number;
        }[];
      };
      get_orders_by_status_range: {
        Args: { from_date: string; to_date: string };
        Returns: { status: string; order_count: number; revenue: number }[];
      };
      get_orders_by_pack_type_range: {
        Args: { from_date: string; to_date: string };
        Returns: { pack_type: string; order_count: number }[];
      };
      get_top_schools: {
        Args: { from_date: string; to_date: string; result_limit?: number };
        Returns: { school_name: string | null; order_count: number; revenue: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
