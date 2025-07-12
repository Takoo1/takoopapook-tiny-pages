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
      locations: {
        Row: {
          bullet_points: string[] | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
