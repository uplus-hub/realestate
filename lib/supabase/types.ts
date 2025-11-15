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
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'consumer' | 'vendor' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'consumer' | 'vendor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'consumer' | 'vendor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          space_types: string[];
          area_value: number;
          area_unit: '평' | '㎡';
          budget: number;
          is_rental: boolean;
          rental_checklist: Json | null;
          status: 'pending' | 'quoted' | 'contracted' | 'in_progress' | 'completed' | 'cancelled';
          sla_deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          space_types: string[];
          area_value: number;
          area_unit: '평' | '㎡';
          budget: number;
          is_rental?: boolean;
          rental_checklist?: Json | null;
          status?: 'pending' | 'quoted' | 'contracted' | 'in_progress' | 'completed' | 'cancelled';
          sla_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          space_types?: string[];
          area_value?: number;
          area_unit?: '평' | '㎡';
          budget?: number;
          is_rental?: boolean;
          rental_checklist?: Json | null;
          status?: 'pending' | 'quoted' | 'contracted' | 'in_progress' | 'completed' | 'cancelled';
          sla_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          project_id: string;
          vendor_id: string;
          line_items: Json;
          total_amount: number;
          valid_until: string | null;
          status: 'pending' | 'accepted' | 'rejected' | 'expired';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          vendor_id: string;
          line_items: Json;
          total_amount: number;
          valid_until?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'expired';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          vendor_id?: string;
          line_items?: Json;
          total_amount?: number;
          valid_until?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'expired';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'consumer' | 'vendor' | 'admin';
      project_status: 'pending' | 'quoted' | 'contracted' | 'in_progress' | 'completed' | 'cancelled';
      quote_status: 'pending' | 'accepted' | 'rejected' | 'expired';
    };
  };
}

