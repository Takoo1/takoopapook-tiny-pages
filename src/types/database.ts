export interface Location {
  id: string;
  name: string;
  coordinates_x: number;
  coordinates_y: number;
  description: string | null;
  bullet_points: string[] | null;
  images: string[] | null;
  rating: number;
  reviews_count: number;
  reviews: string[];
  packages_included: string[];
  categories: string[];
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Package {
  id: string;
  package_code: string;
  title: string;
  location: string;
  duration: string;
  group_size: string;
  price: string;
  rating: number;
  reviews_count: number;
  image_url: string;
  features: string[];
  locations_included: string[];
  reviews: string[];
  is_active: boolean;
  is_editable: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  item_type: 'package' | 'destination';
  item_id: string;
  experience_summary: string;
  detailed_review: string;
  reviewer_name: string;
  images: string[];
  videos: string[];
  rating: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlannedLocation {
  id: string;
  location_id: string;
  user_session: string;
  planned_at: string;
  notes?: string | null;
}

export interface MapSettings {
  id: string;
  initial_zoom: number | null;
  center_x: number | null;
  center_y: number | null;
  min_zoom: number | null;
  max_zoom: number | null;
  updated_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: Location;
        Insert: Omit<Location, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>>;
      };
      packages: {
        Row: Package;
        Insert: Omit<Package, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Package, 'id' | 'created_at' | 'updated_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>;
      };
      map_settings: {
        Row: MapSettings;
        Insert: Omit<MapSettings, 'id' | 'updated_at'>;
        Update: Partial<Omit<MapSettings, 'id' | 'updated_at'>>;
      };
      planned_locations: {
        Row: PlannedLocation;
        Insert: Omit<PlannedLocation, 'id' | 'planned_at'>;
        Update: Partial<Omit<PlannedLocation, 'id' | 'planned_at'>>;
      };
    };
  };
}