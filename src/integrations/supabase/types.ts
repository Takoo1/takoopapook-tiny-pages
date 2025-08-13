export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      booking_cancellations: {
        Row: {
          booking_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          status: string
          updated_at: string
          user_session: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          status?: string
          updated_at?: string
          user_session?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          status?: string
          updated_at?: string
          user_session?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_cancellations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          id: string
          package_duration: string
          package_id: string
          package_image_url: string
          package_location: string
          package_price: string
          package_title: string
          status: string
          total_price: number
          tourists: Json
          updated_at: string
          user_session: string | null
        }
        Insert: {
          booking_date?: string
          created_at?: string
          id?: string
          package_duration: string
          package_id: string
          package_image_url: string
          package_location: string
          package_price: string
          package_title: string
          status?: string
          total_price: number
          tourists: Json
          updated_at?: string
          user_session?: string | null
        }
        Update: {
          booking_date?: string
          created_at?: string
          id?: string
          package_duration?: string
          package_id?: string
          package_image_url?: string
          package_location?: string
          package_price?: string
          package_title?: string
          status?: string
          total_price?: number
          tourists?: Json
          updated_at?: string
          user_session?: string | null
        }
        Relationships: []
      }
      fc_balances: {
        Row: {
          balance: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fc_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          type: Database["public"]["Enums"]["fc_tx_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          type: Database["public"]["Enums"]["fc_tx_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          type?: Database["public"]["Enums"]["fc_tx_type"]
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          bullet_points: string[] | null
          categories: string[] | null
          coordinates_x: number
          coordinates_y: number
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          packages_included: string[]
          rating: number
          reviews: string[]
          reviews_count: number
          updated_at: string | null
        }
        Insert: {
          bullet_points?: string[] | null
          categories?: string[] | null
          coordinates_x: number
          coordinates_y: number
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          packages_included?: string[]
          rating?: number
          reviews?: string[]
          reviews_count?: number
          updated_at?: string | null
        }
        Update: {
          bullet_points?: string[] | null
          categories?: string[] | null
          coordinates_x?: number
          coordinates_y?: number
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          packages_included?: string[]
          rating?: number
          reviews?: string[]
          reviews_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      map_settings: {
        Row: {
          center_x: number | null
          center_y: number | null
          id: string
          initial_zoom: number | null
          max_zoom: number | null
          min_zoom: number | null
          updated_at: string | null
        }
        Insert: {
          center_x?: number | null
          center_y?: number | null
          id?: string
          initial_zoom?: number | null
          max_zoom?: number | null
          min_zoom?: number | null
          updated_at?: string | null
        }
        Update: {
          center_x?: number | null
          center_y?: number | null
          id?: string
          initial_zoom?: number | null
          max_zoom?: number | null
          min_zoom?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          duration: string
          features: string[]
          group_size: string
          id: string
          image_url: string
          is_active: boolean
          is_editable: boolean
          location: string
          locations_included: string[]
          package_code: string
          price: string
          rating: number
          reviews: string[]
          reviews_count: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration: string
          features?: string[]
          group_size: string
          id?: string
          image_url: string
          is_active?: boolean
          is_editable?: boolean
          location: string
          locations_included?: string[]
          package_code: string
          price: string
          rating?: number
          reviews?: string[]
          reviews_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string
          features?: string[]
          group_size?: string
          id?: string
          image_url?: string
          is_active?: boolean
          is_editable?: boolean
          location?: string
          locations_included?: string[]
          package_code?: string
          price?: string
          rating?: number
          reviews?: string[]
          reviews_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      planned_locations: {
        Row: {
          id: string
          location_id: string
          notes: string | null
          planned_at: string
          user_session: string
        }
        Insert: {
          id?: string
          location_id: string
          notes?: string | null
          planned_at?: string
          user_session: string
        }
        Update: {
          id?: string
          location_id?: string
          notes?: string | null
          planned_at?: string
          user_session?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_packages: {
        Row: {
          id: string
          notes: string | null
          package_id: string
          planned_at: string
          user_session: string
        }
        Insert: {
          id?: string
          notes?: string | null
          package_id: string
          planned_at?: string
          user_session: string
        }
        Update: {
          id?: string
          notes?: string | null
          package_id?: string
          planned_at?: string
          user_session?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          referral_code: string | null
          referred_by_user_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          referral_code?: string | null
          referred_by_user_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          referral_code?: string | null
          referred_by_user_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          detailed_review: string
          experience_summary: string
          id: string
          images: string[] | null
          is_published: boolean | null
          item_id: string
          item_type: string
          rating: number | null
          reviewer_name: string
          updated_at: string
          videos: string[] | null
        }
        Insert: {
          created_at?: string
          detailed_review: string
          experience_summary: string
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          item_id: string
          item_type: string
          rating?: number | null
          reviewer_name: string
          updated_at?: string
          videos?: string[] | null
        }
        Update: {
          created_at?: string
          detailed_review?: string
          experience_summary?: string
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          item_id?: string
          item_type?: string
          rating?: number | null
          reviewer_name?: string
          updated_at?: string
          videos?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_purchase_bonus: {
        Args: { ticket_prices: number[] }
        Returns: number
      }
      award_referrer_bonus_if_applicable: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ensure_fc_setup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      redeem_fc_by_rupees: {
        Args: { discount_rupees: number }
        Returns: {
          used_fc: number
          new_balance: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      fc_tx_type:
        | "earn"
        | "redeem"
        | "signup_bonus"
        | "purchase_bonus"
        | "referral_bonus"
        | "adjust"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "user"],
      fc_tx_type: [
        "earn",
        "redeem",
        "signup_bonus",
        "purchase_bonus",
        "referral_bonus",
        "adjust",
      ],
    },
  },
} as const
