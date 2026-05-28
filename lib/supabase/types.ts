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
          data: Json;
          source_url: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_type: string;
          status?: string;
          data: Json;
          source_url?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_type?: string;
          status?: string;
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
          search_vector: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          slug: string;
          city?: string | null;
          province?: string | null;
          logo?: string | null;
          is_partner?: boolean;
          is_featured?: boolean;
          lowest_price?: number | null;
          grades?: Json | null;
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
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
