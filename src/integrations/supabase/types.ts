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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
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
      fc_referral_awards: {
        Row: {
          awarded_at: string
          id: string
          referred_user_id: string
          referrer_user_id: string
        }
        Insert: {
          awarded_at?: string
          id?: string
          referred_user_id: string
          referrer_user_id: string
        }
        Update: {
          awarded_at?: string
          id?: string
          referred_user_id?: string
          referrer_user_id?: string
        }
        Relationships: []
      }
      fc_transactions: {
        Row: {
          amount_fc: number
          created_at: string
          id: string
          metadata: Json | null
          tx_type: string
          user_id: string
        }
        Insert: {
          amount_fc: number
          created_at?: string
          id?: string
          metadata?: Json | null
          tx_type: string
          user_id: string
        }
        Update: {
          amount_fc?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          tx_type?: string
          user_id?: string
        }
        Relationships: []
      }
      fortune_counter_requests: {
        Row: {
          amount_due: number
          confirmed_at: string | null
          confirmed_by_organizer_id: string | null
          created_at: string
          id: string
          lottery_game_id: string
          notes: string | null
          requested_by_admin_id: string
          status: string
          ticket_count: number
          updated_at: string
        }
        Insert: {
          amount_due: number
          confirmed_at?: string | null
          confirmed_by_organizer_id?: string | null
          created_at?: string
          id?: string
          lottery_game_id: string
          notes?: string | null
          requested_by_admin_id: string
          status?: string
          ticket_count: number
          updated_at?: string
        }
        Update: {
          amount_due?: number
          confirmed_at?: string | null
          confirmed_by_organizer_id?: string | null
          created_at?: string
          id?: string
          lottery_game_id?: string
          notes?: string | null
          requested_by_admin_id?: string
          status?: string
          ticket_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      fortune_counter_resets: {
        Row: {
          created_at: string
          id: string
          lottery_game_id: string
          requested_by_admin_id: string | null
          reset_by_user_id: string | null
          reset_date: string
          ticket_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lottery_game_id: string
          requested_by_admin_id?: string | null
          reset_by_user_id?: string | null
          reset_date?: string
          ticket_count: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lottery_game_id?: string
          requested_by_admin_id?: string | null
          reset_by_user_id?: string | null
          reset_date?: string
          ticket_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fortune_counter_resets_lottery_game_id_fkey"
            columns: ["lottery_game_id"]
            isOneToOne: false
            referencedRelation: "lottery_games"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_slider_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lottery_books: {
        Row: {
          book_name: string
          created_at: string
          first_ticket_number: number
          id: string
          is_online_available: boolean
          last_ticket_number: number
          lottery_game_id: string
          updated_at: string
        }
        Insert: {
          book_name: string
          created_at?: string
          first_ticket_number: number
          id?: string
          is_online_available?: boolean
          last_ticket_number: number
          lottery_game_id: string
          updated_at?: string
        }
        Update: {
          book_name?: string
          created_at?: string
          first_ticket_number?: number
          id?: string
          is_online_available?: boolean
          last_ticket_number?: number
          lottery_game_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_books_lottery_game_id_fkey"
            columns: ["lottery_game_id"]
            isOneToOne: false
            referencedRelation: "lottery_games"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_games: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          game_code: string | null
          game_date: string
          game_password: string | null
          headline: string | null
          id: string
          last_ticket_number: number | null
          live_draw_url: string | null
          organiser_logo_url: string | null
          organising_group_name: string | null
          starting_ticket_number: number | null
          status: Database["public"]["Enums"]["game_status"]
          stop_booking_time: string | null
          ticket_image_url: string | null
          ticket_price: number | null
          ticket_serial_config: Json
          title: string
          total_tickets: number
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          game_code?: string | null
          game_date: string
          game_password?: string | null
          headline?: string | null
          id?: string
          last_ticket_number?: number | null
          live_draw_url?: string | null
          organiser_logo_url?: string | null
          organising_group_name?: string | null
          starting_ticket_number?: number | null
          status?: Database["public"]["Enums"]["game_status"]
          stop_booking_time?: string | null
          ticket_image_url?: string | null
          ticket_price?: number | null
          ticket_serial_config?: Json
          title: string
          total_tickets?: number
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          game_code?: string | null
          game_date?: string
          game_password?: string | null
          headline?: string | null
          id?: string
          last_ticket_number?: number | null
          live_draw_url?: string | null
          organiser_logo_url?: string | null
          organising_group_name?: string | null
          starting_ticket_number?: number | null
          status?: Database["public"]["Enums"]["game_status"]
          stop_booking_time?: string | null
          ticket_image_url?: string | null
          ticket_price?: number | null
          ticket_serial_config?: Json
          title?: string
          total_tickets?: number
          updated_at?: string
        }
        Relationships: []
      }
      lottery_organising_committee: {
        Row: {
          created_at: string
          designation: string
          display_order: number
          id: string
          lottery_game_id: string
          member_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          designation: string
          display_order?: number
          id?: string
          lottery_game_id: string
          member_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          designation?: string
          display_order?: number
          id?: string
          lottery_game_id?: string
          member_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_organising_committee_lottery_game_id_fkey"
            columns: ["lottery_game_id"]
            isOneToOne: false
            referencedRelation: "lottery_games"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_prizes: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          lottery_game_id: string
          prize_type: Database["public"]["Enums"]["prize_type"]
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          lottery_game_id: string
          prize_type: Database["public"]["Enums"]["prize_type"]
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          lottery_game_id?: string
          prize_type?: Database["public"]["Enums"]["prize_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_prizes_lottery_game_id_fkey"
            columns: ["lottery_game_id"]
            isOneToOne: false
            referencedRelation: "lottery_games"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_terms: {
        Row: {
          content: string
          created_at: string
          display_order: number
          id: string
          lottery_game_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number
          id?: string
          lottery_game_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number
          id?: string
          lottery_game_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_terms_lottery_game_id_fkey"
            columns: ["lottery_game_id"]
            isOneToOne: false
            referencedRelation: "lottery_games"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_tickets: {
        Row: {
          book_id: string | null
          booked_at: string | null
          booked_by_address: string | null
          booked_by_email: string | null
          booked_by_name: string | null
          booked_by_phone: string | null
          booked_by_user_id: string | null
          created_at: string
          id: string
          lottery_game_id: string
          rendered_at: string | null
          rendered_ticket_url: string | null
          status: string
          ticket_number: number
        }
        Insert: {
          book_id?: string | null
          booked_at?: string | null
          booked_by_address?: string | null
          booked_by_email?: string | null
          booked_by_name?: string | null
          booked_by_phone?: string | null
          booked_by_user_id?: string | null
          created_at?: string
          id?: string
          lottery_game_id: string
          rendered_at?: string | null
          rendered_ticket_url?: string | null
          status?: string
          ticket_number: number
        }
        Update: {
          book_id?: string | null
          booked_at?: string | null
          booked_by_address?: string | null
          booked_by_email?: string | null
          booked_by_name?: string | null
          booked_by_phone?: string | null
          booked_by_user_id?: string | null
          created_at?: string
          id?: string
          lottery_game_id?: string
          rendered_at?: string | null
          rendered_ticket_url?: string | null
          status?: string
          ticket_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "lottery_tickets_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "lottery_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_tickets_lottery_game_id_fkey"
            columns: ["lottery_game_id"]
            isOneToOne: false
            referencedRelation: "lottery_games"
            referencedColumns: ["id"]
          },
        ]
      }
      media_video_links: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          display_order: number
          id: string
          is_active: boolean
          label: string
          updated_at: string
          url: string
          video_id: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          updated_at?: string
          url: string
          video_id: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
          url?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_video_links_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "media_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      media_video_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          user_id: string | null
          user_session: string | null
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string | null
          user_session?: string | null
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string | null
          user_session?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_video_reactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "media_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      media_videos: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          full_name: string | null
          id: string
          referral_code: string | null
          referred_by_user_id: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          full_name?: string | null
          id?: string
          referral_code?: string | null
          referred_by_user_id?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          full_name?: string | null
          id?: string
          referral_code?: string | null
          referred_by_user_id?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_request_fortune_reset: {
        Args: { p_game_id: string }
        Returns: string
      }
      award_purchase_bonus: {
        Args: { ticket_prices: number[] }
        Returns: undefined
      }
      award_referrer_bonus_if_applicable: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_fc_setup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      game_is_live_or_owned: {
        Args: { p_game_id: string; p_user_id?: string }
        Returns: boolean
      }
      generate_lottery_tickets: {
        Args:
          | { end_num: number; game_id: string; start_num: number }
          | { game_id: string; num_tickets: number }
        Returns: undefined
      }
      generate_lottery_tickets_for_book: {
        Args: {
          book_id: string
          end_num: number
          game_id: string
          start_num: number
        }
        Returns: undefined
      }
      generate_random_code: {
        Args: { length: number }
        Returns: string
      }
      get_fortune_counter: {
        Args: { game_id: string }
        Returns: number
      }
      get_referrer_display_name: {
        Args: { ref_code: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      link_referral: {
        Args: { ref_code: string }
        Returns: undefined
      }
      organizer_confirm_fortune_reset: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      purchase_fc: {
        Args: { amount_fc: number; payment_details?: Json }
        Returns: {
          new_balance: number
          transaction_id: string
        }[]
      }
      purge_lottery_game: {
        Args: { p_game_id: string }
        Returns: undefined
      }
      redeem_fc_by_rupees: {
        Args: { discount_rupees: number }
        Returns: {
          new_balance: number
        }[]
      }
      update_lottery_statuses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_ticket_in_game: {
        Args: { p_game_id: string; p_user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "organiser"
      game_status:
        | "pending"
        | "live"
        | "ended"
        | "online"
        | "booking_stopped"
        | "archived"
      prize_type: "main" | "incentive"
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
      app_role: ["admin", "user", "organiser"],
      game_status: [
        "pending",
        "live",
        "ended",
        "online",
        "booking_stopped",
        "archived",
      ],
      prize_type: ["main", "incentive"],
    },
  },
} as const
