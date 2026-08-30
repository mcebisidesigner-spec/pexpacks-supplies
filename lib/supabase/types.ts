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
      auth_otp_tokens: {
        Row: {
          id: string;
          email: string;
          otp_code: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          otp_code: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          otp_code?: string;
          expires_at?: string;
          used?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      security_audit_logs: {
        Row: {
          id: string;
          ip_address: string;
          user_agent: string | null;
          event_type: string;
          email_masked: string | null;
          user_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ip_address: string;
          user_agent?: string | null;
          event_type: string;
          email_masked?: string | null;
          user_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ip_address?: string;
          user_agent?: string | null;
          event_type?: string;
          email_masked?: string | null;
          user_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
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
      payments: {
        Row: {
          id: string;
          order_reference: string | null;
          gateway_reference: string | null;
          amount: number | null;
          currency: string;
          payment_gateway: string;
          status: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_reference?: string | null;
          gateway_reference?: string | null;
          amount?: number | null;
          currency?: string;
          payment_gateway?: string;
          status?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_reference?: string | null;
          gateway_reference?: string | null;
          amount?: number | null;
          currency?: string;
          payment_gateway?: string;
          status?: string;
          metadata?: Json | null;
          created_at?: string;
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
          unique_customer_id: string | null;
          tracking_token: string | null;
          courier_name: string | null;
          waybill_number: string | null;
          estimated_delivery: string | null;
          idempotency_key: string | null;
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
          unique_customer_id?: string | null;
          tracking_token?: string | null;
          courier_name?: string | null;
          waybill_number?: string | null;
          estimated_delivery?: string | null;
          idempotency_key?: string | null;
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
          unique_customer_id?: string | null;
          tracking_token?: string | null;
          courier_name?: string | null;
          waybill_number?: string | null;
          estimated_delivery?: string | null;
          idempotency_key?: string | null;
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
          },
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
          },
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
          refused_partnership: boolean;
          lowest_price: number | null;
          grades: Json | null;
          district: string | null;
          address: string | null;
          email: string | null;
          telephone: string | null;
          principal: string | null;
          parent_collection_accepted: boolean;
          description: string | null;
          status: string;
          partner_since: string | null;
          latitude: number | null;
          longitude: number | null;
          published: boolean;
          publication_status?: "published" | "ready_for_review" | null;
          partnership?: "partner" | "non_partner" | "refused_partner" | null;
          feature_status?: "featured" | "unfeatured" | null;
          directory_status?: "listed" | "hidden" | "archived" | null;
          stationery_list_status?: "not_received" | "received" | "being_digitised" | "verified" | null;
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
          refused_partnership?: boolean;
          lowest_price?: number | null;
          grades?: Json | null;
          district?: string | null;
          address?: string | null;
          email?: string | null;
          telephone?: string | null;
          principal?: string | null;
          parent_collection_accepted?: boolean;
          description?: string | null;
          status?: string;
          partner_since?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          published?: boolean;
          publication_status?: "published" | "ready_for_review" | null;
          partnership?: "partner" | "non_partner" | "refused_partner" | null;
          feature_status?: "featured" | "unfeatured" | null;
          directory_status?: "listed" | "hidden" | "archived" | null;
          stationery_list_status?: "not_received" | "received" | "being_digitised" | "verified" | null;
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
          refused_partnership?: boolean;
          lowest_price?: number | null;
          grades?: Json | null;
          district?: string | null;
          address?: string | null;
          email?: string | null;
          telephone?: string | null;
          principal?: string | null;
          parent_collection_accepted?: boolean;
          description?: string | null;
          status?: string;
          partner_since?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          published?: boolean;
          publication_status?: "published" | "ready_for_review" | null;
          partnership?: "partner" | "non_partner" | "refused_partner" | null;
          feature_status?: "featured" | "unfeatured" | null;
          directory_status?: "listed" | "hidden" | "archived" | null;
          stationery_list_status?: "not_received" | "received" | "being_digitised" | "verified" | null;
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
          },
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
          },
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
          },
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
      school_packs: {
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
          season_id: string | null;
          list_version: number;
          pricing_status: string;
          fulfilment_deadline: string | null;
          publication_status?: "draft" | "ready_for_review" | "published" | "archived" | null;
          published_at?: string | null;
          published_by?: string | null;
          version?: number;
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
          season_id?: string | null;
          list_version?: number;
          pricing_status?: string;
          fulfilment_deadline?: string | null;
          publication_status?: "draft" | "ready_for_review" | "published" | "archived" | null;
          published_at?: string | null;
          published_by?: string | null;
          version?: number;
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
          season_id?: string | null;
          list_version?: number;
          pricing_status?: string;
          fulfilment_deadline?: string | null;
          publication_status?: "draft" | "ready_for_review" | "published" | "archived" | null;
          published_at?: string | null;
          published_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "school_packs_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
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
      dashboard_summaries: {
        Row: {
          id: string;
          total_orders: number;
          paid_orders: number;
          pending_orders: number;
          total_revenue: number;
          total_schools: number;
          total_packs: number;
          orders_today: number;
          orders_this_week: number;
          awaiting_fulfilment: number;
          completed_orders: number;
          active_packs: number;
          last_updated_at: string;
        };
        Insert: {
          id?: string;
          total_orders?: number;
          paid_orders?: number;
          pending_orders?: number;
          total_revenue?: number;
          total_schools?: number;
          total_packs?: number;
          orders_today?: number;
          orders_this_week?: number;
          awaiting_fulfilment?: number;
          completed_orders?: number;
          active_packs?: number;
          last_updated_at?: string;
        };
        Update: {
          id?: string;
          total_orders?: number;
          paid_orders?: number;
          pending_orders?: number;
          total_revenue?: number;
          total_schools?: number;
          total_packs?: number;
          orders_today?: number;
          orders_this_week?: number;
          awaiting_fulfilment?: number;
          completed_orders?: number;
          active_packs?: number;
          last_updated_at?: string;
        };
        Relationships: [];
      };
      seasons: {
        Row: {
          id: string;
          name: string;
          academic_year: number;
          starts_on: string | null;
          ordering_closes_on: string | null;
          fulfilment_starts_on: string | null;
          fulfilment_ends_on: string | null;
          status: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          academic_year: number;
          starts_on?: string | null;
          ordering_closes_on?: string | null;
          fulfilment_starts_on?: string | null;
          fulfilment_ends_on?: string | null;
          status?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          academic_year?: number;
          starts_on?: string | null;
          ordering_closes_on?: string | null;
          fulfilment_starts_on?: string | null;
          fulfilment_ends_on?: string | null;
          status?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          telephone: string | null;
          job_title: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          telephone?: string | null;
          job_title?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          telephone?: string | null;
          job_title?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learners: {
        Row: {
          id: string;
          customer_id: string;
          school_id: string | null;
          full_name: string;
          grade: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          school_id?: string | null;
          full_name: string;
          grade?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          school_id?: string | null;
          full_name?: string;
          grade?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learners_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learners_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      master_products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          description: string | null;
          category: string | null;
          brand: string | null;
          unit: string | null;
          packaging: string | null;
          specification: string | null;
          icon: string | null;
          visibility: string;
          availability: string;
          calculated_selling_price: number | null;
          selling_price_override: number | null;
          current_selling_price: number;
          latest_verified_cost: number | null;
          target_markup: number | null;
          target_margin: number | null;
          pricing_status: string;
          preferred_supplier_id: string | null;
          last_verified_at: string | null;
          active: boolean;
          search_vector: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          requires_pexcover: boolean;
          pexco_code: string | null;
        };
        Insert: {
          id?: string;
          sku: string;
          name: string;
          description?: string | null;
          category?: string | null;
          brand?: string | null;
          unit?: string | null;
          packaging?: string | null;
          specification?: string | null;
          icon?: string | null;
          visibility?: string;
          availability?: string;
          calculated_selling_price?: number | null;
          selling_price_override?: number | null;
          current_selling_price?: number;
          latest_verified_cost?: number | null;
          target_markup?: number | null;
          target_margin?: number | null;
          pricing_status?: string;
          preferred_supplier_id?: string | null;
          last_verified_at?: string | null;
          active?: boolean;
          search_vector?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          requires_pexcover?: boolean;
          pexco_code?: string | null;
        };
        Update: {
          id?: string;
          sku?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          brand?: string | null;
          unit?: string | null;
          packaging?: string | null;
          specification?: string | null;
          icon?: string | null;
          visibility?: string;
          availability?: string;
          calculated_selling_price?: number | null;
          selling_price_override?: number | null;
          current_selling_price?: number;
          latest_verified_cost?: number | null;
          target_markup?: number | null;
          target_margin?: number | null;
          pricing_status?: string;
          preferred_supplier_id?: string | null;
          last_verified_at?: string | null;
          active?: boolean;
          search_vector?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          requires_pexcover?: boolean;
          pexco_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "master_products_preferred_supplier_id_fkey";
            columns: ["preferred_supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      school_pack_items: {
        Row: {
          id: string;
          pack_id: string;
          product_id: string;
          pack_quantity: number;
          school_wording: string | null;
          prescribed_brand: string | null;
          substitution_policy: string;
          school_notes: string | null;
          selling_price_override: number | null;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pack_id: string;
          product_id: string;
          pack_quantity?: number;
          school_wording?: string | null;
          prescribed_brand?: string | null;
          substitution_policy?: string;
          school_notes?: string | null;
          selling_price_override?: number | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pack_id?: string;
          product_id?: string;
          pack_quantity?: number;
          school_wording?: string | null;
          prescribed_brand?: string | null;
          substitution_policy?: string;
          school_notes?: string | null;
          selling_price_override?: number | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "school_pack_items_pack_id_fkey";
            columns: ["pack_id"];
            isOneToOne: false;
            referencedRelation: "school_packs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "school_pack_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "master_products";
            referencedColumns: ["id"];
          },
        ];
      };
      suppliers: {
        Row: {
          id: string;
          code: string;
          name: string;
          contact_name: string | null;
          email: string | null;
          telephone: string | null;
          address: string | null;
          payment_terms: string | null;
          lead_time_days: number | null;
          active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          contact_name?: string | null;
          email?: string | null;
          telephone?: string | null;
          address?: string | null;
          payment_terms?: string | null;
          lead_time_days?: number | null;
          active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          contact_name?: string | null;
          email?: string | null;
          telephone?: string | null;
          address?: string | null;
          payment_terms?: string | null;
          lead_time_days?: number | null;
          active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      supplier_quote_imports: {
        Row: {
          id: string;
          supplier_id: string;
          source_file_name: string | null;
          storage_path: string | null;
          status: string;
          imported_rows: number;
          rejected_rows: number;
          errors: Json;
          imported_by: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          source_file_name?: string | null;
          storage_path?: string | null;
          status?: string;
          imported_rows?: number;
          rejected_rows?: number;
          errors?: Json;
          imported_by?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          source_file_name?: string | null;
          storage_path?: string | null;
          status?: string;
          imported_rows?: number;
          rejected_rows?: number;
          errors?: Json;
          imported_by?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_quote_imports_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      supplier_offers: {
        Row: {
          id: string;
          supplier_id: string;
          product_id: string;
          quote_import_id: string | null;
          supplier_sku: string | null;
          unit_cost: number;
          currency: string;
          minimum_order_quantity: number;
          available_quantity: number | null;
          lead_time_days: number | null;
          valid_from: string;
          valid_until: string | null;
          verified_at: string | null;
          is_preferred: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          product_id: string;
          quote_import_id?: string | null;
          supplier_sku?: string | null;
          unit_cost: number;
          currency?: string;
          minimum_order_quantity?: number;
          available_quantity?: number | null;
          lead_time_days?: number | null;
          valid_from?: string;
          valid_until?: string | null;
          verified_at?: string | null;
          is_preferred?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          product_id?: string;
          quote_import_id?: string | null;
          supplier_sku?: string | null;
          unit_cost?: number;
          currency?: string;
          minimum_order_quantity?: number;
          available_quantity?: number | null;
          lead_time_days?: number | null;
          valid_from?: string;
          valid_until?: string | null;
          verified_at?: string | null;
          is_preferred?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_offers_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supplier_offers_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "master_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supplier_offers_quote_import_id_fkey";
            columns: ["quote_import_id"];
            isOneToOne: false;
            referencedRelation: "supplier_quote_imports";
            referencedColumns: ["id"];
          },
        ];
      };
      pricing_rules: {
        Row: {
          id: string;
          name: string;
          scope: string;
          scope_value: string | null;
          method: string;
          rate: number;
          rounding_increment: number;
          priority: number;
          active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          scope: string;
          scope_value?: string | null;
          method: string;
          rate: number;
          rounding_increment?: number;
          priority?: number;
          active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          scope?: string;
          scope_value?: string | null;
          method?: string;
          rate?: number;
          rounding_increment?: number;
          priority?: number;
          active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      price_history: {
        Row: {
          id: string;
          product_id: string;
          supplier_id: string | null;
          previous_cost: number | null;
          new_cost: number | null;
          previous_selling_price: number | null;
          new_selling_price: number | null;
          previous_margin: number | null;
          new_margin: number | null;
          reason: string | null;
          source: string | null;
          changed_by: string | null;
          approved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          supplier_id?: string | null;
          previous_cost?: number | null;
          new_cost?: number | null;
          previous_selling_price?: number | null;
          new_selling_price?: number | null;
          previous_margin?: number | null;
          new_margin?: number | null;
          reason?: string | null;
          source?: string | null;
          changed_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          supplier_id?: string | null;
          previous_cost?: number | null;
          new_cost?: number | null;
          previous_selling_price?: number | null;
          new_selling_price?: number | null;
          previous_margin?: number | null;
          new_margin?: number | null;
          reason?: string | null;
          source?: string | null;
          changed_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "master_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "price_history_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          pack_id: string | null;
          sku_snapshot: string;
          product_name_snapshot: string;
          description_snapshot: string | null;
          quantity: number;
          unit_selling_price: number;
          line_total: number;
          estimated_unit_cost: number | null;
          expected_margin: number | null;
          pricing_version: string | null;
          school_name_snapshot: string | null;
          grade_snapshot: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          pack_id?: string | null;
          sku_snapshot: string;
          product_name_snapshot: string;
          description_snapshot?: string | null;
          quantity: number;
          unit_selling_price: number;
          line_total?: number;
          estimated_unit_cost?: number | null;
          expected_margin?: number | null;
          pricing_version?: string | null;
          school_name_snapshot?: string | null;
          grade_snapshot?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          pack_id?: string | null;
          sku_snapshot?: string;
          product_name_snapshot?: string;
          description_snapshot?: string | null;
          quantity?: number;
          unit_selling_price?: number;
          line_total?: number;
          estimated_unit_cost?: number | null;
          expected_margin?: number | null;
          pricing_version?: string | null;
          school_name_snapshot?: string | null;
          grade_snapshot?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "master_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_pack_id_fkey";
            columns: ["pack_id"];
            isOneToOne: false;
            referencedRelation: "school_packs";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_events: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          payment_method: string;
          gateway_reference: string | null;
          event_key: string;
          status: string;
          amount: number | null;
          currency: string;
          payload: Json;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider?: string;
          payment_method?: string;
          gateway_reference?: string | null;
          event_key: string;
          status: string;
          amount?: number | null;
          currency?: string;
          payload?: Json;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          provider?: string;
          payment_method?: string;
          gateway_reference?: string | null;
          event_key?: string;
          status?: string;
          amount?: number | null;
          currency?: string;
          payload?: Json;
          processed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      procurement_requirements: {
        Row: {
          id: string;
          season_id: string;
          product_id: string;
          required_quantity: number;
          requested_quantity: number;
          supplier_confirmed_quantity: number;
          secured_quantity: number;
          received_quantity: number;
          allocated_quantity: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          product_id: string;
          required_quantity?: number;
          requested_quantity?: number;
          supplier_confirmed_quantity?: number;
          secured_quantity?: number;
          received_quantity?: number;
          allocated_quantity?: number;
          status?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          product_id?: string;
          required_quantity?: number;
          requested_quantity?: number;
          supplier_confirmed_quantity?: number;
          secured_quantity?: number;
          received_quantity?: number;
          allocated_quantity?: number;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "procurement_requirements_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "procurement_requirements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "master_products";
            referencedColumns: ["id"];
          },
        ];
      };
      procurement_requirement_orders: {
        Row: {
          id: string;
          requirement_id: string;
          order_id: string;
          order_item_id: string;
          required_quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          requirement_id: string;
          order_id: string;
          order_item_id: string;
          required_quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          requirement_id?: string;
          order_id?: string;
          order_item_id?: string;
          required_quantity?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "procurement_requirement_orders_requirement_id_fkey";
            columns: ["requirement_id"];
            isOneToOne: false;
            referencedRelation: "procurement_requirements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "procurement_requirement_orders_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "procurement_requirement_orders_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
        ];
      };
      supplier_purchase_orders: {
        Row: {
          id: string;
          purchase_order_number: string;
          supplier_id: string;
          season_id: string | null;
          status: string;
          currency: string;
          expected_on: string | null;
          notes: string | null;
          created_by: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_order_number: string;
          supplier_id: string;
          season_id?: string | null;
          status?: string;
          currency?: string;
          expected_on?: string | null;
          notes?: string | null;
          created_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          purchase_order_number?: string;
          supplier_id?: string;
          season_id?: string | null;
          status?: string;
          currency?: string;
          expected_on?: string | null;
          notes?: string | null;
          created_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_purchase_orders_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supplier_purchase_orders_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ];
      };
      supplier_purchase_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          requirement_id: string | null;
          product_id: string;
          ordered_quantity: number;
          confirmed_quantity: number;
          received_quantity: number;
          unit_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_order_id: string;
          requirement_id?: string | null;
          product_id: string;
          ordered_quantity: number;
          confirmed_quantity?: number;
          received_quantity?: number;
          unit_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_order_id?: string;
          requirement_id?: string | null;
          product_id?: string;
          ordered_quantity?: number;
          confirmed_quantity?: number;
          received_quantity?: number;
          unit_cost?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_purchase_items_purchase_order_id_fkey";
            columns: ["purchase_order_id"];
            isOneToOne: false;
            referencedRelation: "supplier_purchase_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supplier_purchase_items_requirement_id_fkey";
            columns: ["requirement_id"];
            isOneToOne: false;
            referencedRelation: "procurement_requirements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supplier_purchase_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "master_products";
            referencedColumns: ["id"];
          },
        ];
      };
      supplier_receipts: {
        Row: {
          id: string;
          purchase_order_id: string;
          reference: string | null;
          received_by: string | null;
          received_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          purchase_order_id: string;
          reference?: string | null;
          received_by?: string | null;
          received_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          purchase_order_id?: string;
          reference?: string | null;
          received_by?: string | null;
          received_at?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_receipts_purchase_order_id_fkey";
            columns: ["purchase_order_id"];
            isOneToOne: false;
            referencedRelation: "supplier_purchase_orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_product_allocations: {
        Row: {
          id: string;
          order_item_id: string;
          purchase_item_id: string | null;
          quantity: number;
          allocated_by: string | null;
          allocated_at: string;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          purchase_item_id?: string | null;
          quantity: number;
          allocated_by?: string | null;
          allocated_at?: string;
        };
        Update: {
          id?: string;
          order_item_id?: string;
          purchase_item_id?: string | null;
          quantity?: number;
          allocated_by?: string | null;
          allocated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_product_allocations_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_product_allocations_purchase_item_id_fkey";
            columns: ["purchase_item_id"];
            isOneToOne: false;
            referencedRelation: "supplier_purchase_items";
            referencedColumns: ["id"];
          },
        ];
      };
      substitutions: {
        Row: {
          id: string;
          order_item_id: string;
          original_product_id: string | null;
          replacement_product_id: string;
          quantity: number;
          reason: string;
          status: string;
          requested_by: string | null;
          approved_by: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          original_product_id?: string | null;
          replacement_product_id: string;
          quantity: number;
          reason: string;
          status?: string;
          requested_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          order_item_id?: string;
          original_product_id?: string | null;
          replacement_product_id?: string;
          quantity?: number;
          reason?: string;
          status?: string;
          requested_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "substitutions_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "substitutions_original_product_id_fkey";
            columns: ["original_product_id"];
            isOneToOne: false;
            referencedRelation: "master_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "substitutions_replacement_product_id_fkey";
            columns: ["replacement_product_id"];
            isOneToOne: false;
            referencedRelation: "master_products";
            referencedColumns: ["id"];
          },
        ];
      };
      packing_records: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          started_by: string | null;
          checked_by: string | null;
          started_at: string | null;
          checked_at: string | null;
          packed_at: string | null;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status?: string;
          started_by?: string | null;
          checked_by?: string | null;
          started_at?: string | null;
          checked_at?: string | null;
          packed_at?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: string;
          started_by?: string | null;
          checked_by?: string | null;
          started_at?: string | null;
          checked_at?: string | null;
          packed_at?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "packing_records_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      fulfilment_records: {
        Row: {
          id: string;
          order_id: string;
          method: string;
          status: string;
          target_date: string | null;
          school_open_day: string | null;
          courier_name: string | null;
          waybill_number: string | null;
          completed_at: string | null;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          method: string;
          status?: string;
          target_date?: string | null;
          school_open_day?: string | null;
          courier_name?: string | null;
          waybill_number?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          method?: string;
          status?: string;
          target_date?: string | null;
          school_open_day?: string | null;
          courier_name?: string | null;
          waybill_number?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fulfilment_records_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      operational_tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          entity_type: string | null;
          entity_id: string | null;
          status: string;
          priority: string;
          assigned_to: string | null;
          due_at: string | null;
          created_by: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          due_at?: string | null;
          created_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          due_at?: string | null;
          created_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          author_id: string | null;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          author_id?: string | null;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          author_id?: string | null;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "operational_tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      task_mentions: {
        Row: {
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          comment_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          comment_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_mentions_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "task_comments";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          permission_key: string | null;
          type: string;
          title: string;
          body: string | null;
          entity_type: string | null;
          entity_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          permission_key?: string | null;
          type: string;
          title: string;
          body?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          permission_key?: string | null;
          type?: string;
          title?: string;
          body?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      approvals: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          approval_type: string;
          status: string;
          requested_by: string | null;
          decided_by: string | null;
          reason: string | null;
          decision_notes: string | null;
          created_at: string;
          decided_at: string | null;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          approval_type: string;
          status?: string;
          requested_by?: string | null;
          decided_by?: string | null;
          reason?: string | null;
          decision_notes?: string | null;
          created_at?: string;
          decided_at?: string | null;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          approval_type?: string;
          status?: string;
          requested_by?: string | null;
          decided_by?: string | null;
          reason?: string | null;
          decision_notes?: string | null;
          created_at?: string;
          decided_at?: string | null;
        };
        Relationships: [];
      };
      operational_events: {
        Row: {
          id: string;
          event_key: string | null;
          event_type: string;
          entity_type: string;
          entity_id: string;
          actor_id: string | null;
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_key?: string | null;
          event_type: string;
          entity_type: string;
          entity_id: string;
          actor_id?: string | null;
          data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_key?: string | null;
          event_type?: string;
          entity_type?: string;
          entity_id?: string;
          actor_id?: string | null;
          data?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      procurement_command_view: {
        Row: {
          id: string;
          season_id: string;
          product_id: string;
          sku: string;
          product_name: string;
          category: string | null;
          required_quantity: number;
          requested_quantity: number;
          supplier_confirmed_quantity: number;
          secured_quantity: number;
          received_quantity: number;
          allocated_quantity: number;
          outstanding_quantity: number;
          procurement_coverage_percent: number;
          status: string;
          updated_at: string;
        };
        Relationships: [];
      };
      order_readiness_view: {
        Row: {
          order_id: string;
          order_reference: string;
          order_status: string;
          line_count: number;
          required_units: number;
          allocated_units: number;
          readiness_percent: number;
        };
        Relationships: [];
      };
      public_school_directory_view: {
        Row: {
          id: string;
          name: string;
          slug: string;
          city: string | null;
          province: string | null;
          district: string | null;
          logo: string | null;
          partnership: string | null;
          feature_status: string | null;
          partner_since: string | null;
          published: boolean;
          is_partner: boolean;
          is_featured: boolean;
          refused_partnership: boolean;
          lowest_price: number | null;
          grades: Json | null;
          principal: string | null;
          parent_collection_accepted: boolean;
          custom_badge: string | null;
          latitude: number | null;
          longitude: number | null;
          publication_status: string | null;
          directory_status: string | null;
          stationery_list_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      has_permission: { Args: { p_key: string }; Returns: boolean };
      set_user_as_admin: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      grant_role: {
        Args: {
          target_user_id: string;
          role_slug: string;
          granted_by?: string | null;
        };
        Returns: undefined;
      };
      revoke_role: {
        Args: { target_user_id: string; role_slug: string };
        Returns: undefined;
      };
      set_user_permission: {
        Args: {
          target_user_id: string;
          permission_key: string;
          granted: boolean;
          granted_by?: string | null;
        };
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
      search_public_schools: {
        Args: {
          search_query?: string;
          grade_filter?: string;
          phase_filter?: string;
          region_filter?: string;
          result_limit?: number;
          result_offset?: number;
        };
        Returns: {
          id: string;
          name: string;
          slug: string;
          city: string | null;
          district: string | null;
          province: string | null;
          logo: string | null;
          is_partner: boolean;
          is_featured: boolean;
          lowest_price: number | null;
          grades: Json;
          custom_badge: string | null;
          total_count: number;
        }[];
      };
      get_featured_public_schools: {
        Args: { result_limit?: number };
        Returns: {
          id: string;
          name: string;
          slug: string;
          city: string | null;
          district: string | null;
          province: string | null;
          logo: string | null;
          is_partner: boolean;
          is_featured: boolean;
          lowest_price: number | null;
          grades: Json;
          custom_badge: string | null;
        }[];
      };
      get_public_school_pack: {
        Args: { school_slug: string };
        Returns: Json;
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
        Returns: {
          school_name: string | null;
          order_count: number;
          revenue: number;
        }[];
      };
      get_revenue_total: {
        Args: Record<string, never>;
        Returns: { revenue: number }[];
      };
      get_assets_size: {
        Args: Record<string, never>;
        Returns: { size_bytes: number }[];
      };
      get_order_pack_types: {
        Args: Record<string, never>;
        Returns: { pack_type: string }[];
      };
      refresh_all_dashboard_summaries: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      current_operational_season_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      complete_order_payment: {
        Args: {
          p_order_reference: string;
          p_gateway_reference: string;
          p_amount: number;
          p_currency?: string;
          p_provider?: string;
          p_payment_method?: string;
          p_payload?: Json;
        };
        Returns: Json;
      };
      record_order_payment_status: {
        Args: {
          p_order_reference: string;
          p_gateway_reference: string;
          p_status: string;
          p_amount: number;
          p_currency?: string;
          p_payload?: Json;
        };
        Returns: Json;
      };
      allocate_secured_demand: {
        Args: { p_requirement_id: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
