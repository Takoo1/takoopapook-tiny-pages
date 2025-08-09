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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
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
          created_at: string
          description: string | null
          game_code: string | null
          game_date: string
          game_password: string | null
          id: string
          last_ticket_number: number | null
          organising_group_name: string | null
          starting_ticket_number: number | null
          ticket_image_url: string | null
          ticket_price: number | null
          title: string
          total_tickets: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          game_code?: string | null
          game_date: string
          game_password?: string | null
          id?: string
          last_ticket_number?: number | null
          organising_group_name?: string | null
          starting_ticket_number?: number | null
          ticket_image_url?: string | null
          ticket_price?: number | null
          title: string
          total_tickets?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          game_code?: string | null
          game_date?: string
          game_password?: string | null
          id?: string
          last_ticket_number?: number | null
          organising_group_name?: string | null
          starting_ticket_number?: number | null
          ticket_image_url?: string | null
          ticket_price?: number | null
          title?: string
          total_tickets?: number
          updated_at?: string
        }
        Relationships: []
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
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
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
      generate_lottery_tickets: {
        Args:
          | { game_id: string; num_tickets: number }
          | { game_id: string; start_num: number; end_num: number }
        Returns: undefined
      }
      generate_lottery_tickets_for_book: {
        Args: {
          game_id: string
          book_id: string
          start_num: number
          end_num: number
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
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "organiser"
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
    },
  },
} as const
