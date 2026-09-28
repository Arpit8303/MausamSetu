export type UserRole = 'farmer' | 'agricultural_officer' | 'administrator';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  state_id?: number;
  district_id?: number;
  block_id?: number;
  panchayat_id?: number;
  primary_crop?: string;
}

export interface PanchayatLocation {
  id: number;
  block_id: number;
  code: string;
  name: string;
  name_hi?: string;
  latitude: number;
  longitude: number;
  elevation: number;
  aspect: number;
  slope: number;
  area_sq_km: number;
  boundary_geojson?: any;
}

// ── Matches backend NDVIData schema ─────────────────────────────────────────
export interface NDVIData {
  avg_ndvi: number;
  tile_url: string;
  generated_at: string;
}

// ── Matches backend AdvisoryData schema ─────────────────────────────────────
export interface AdvisoryData {
  title: string;
  title_hi: string;
  description: string;
  description_hi: string;
  recommended_action: string;
  recommended_action_hi: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence_pct: number;
  weather_trigger: string;
  is_official: boolean;
}

// ── Matches backend CurrentWeatherResponse schema ────────────────────────────
export interface WeatherIntelligenceResponse {
  panchayat_id: number;
  panchayat_name: string;
  block_name: string;
  district_name: string;
  state_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;

  // Core weather
  temp_c: number;
  feels_like_c: number;
  temp_min_c: number;
  temp_max_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  precipitation_prob_pct: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  pressure_hpa: number;
  weather_condition: string;

  // ML metadata
  confidence_score: number;
  uncertainty_margin_c: number;
  provider_source: string;
  is_simulated: boolean;

  // Cache / source metadata
  data_source: string;
  weather_cached: boolean;
  stale: boolean;
  downscaled: boolean;

  // Optional fields — backend can return null for these
  warnings: string[] | null;
  ndvi: NDVIData | null;
  ndvi_as_of: string | null;
  advisories: AdvisoryData[] | null;
}

// ── Legacy types (used by WeatherCharts, panchayat page) ────────────────────
export interface CurrentWeather {
  panchayat_id: number;
  panchayat_name: string;
  block_name: string;
  district_name: string;
  state_name: string;
  timestamp: string;
  temp_c: number;
  feels_like_c: number;
  temp_min_c: number;
  temp_max_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  precipitation_prob_pct: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  pressure_hpa: number;
  weather_condition: string;
  confidence_score: number;
  uncertainty_margin_c: number;
  provider_source: string;
  is_simulated: boolean;
}

export interface HourlyForecast {
  timestamp: string;
  hour: number;
  temp_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  precipitation_prob_pct: number;
  wind_speed_kmh: number;
  weather_condition: string;
}

export interface DailyForecast {
  date: string;
  day_name: string;
  temp_min_c: number;
  temp_max_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  precipitation_prob_pct: number;
  wind_speed_kmh: number;
  weather_condition: string;
  risk_level: string;
}

export interface WeatherForecastResponse {
  panchayat_id: number;
  panchayat_name: string;
  block_name: string;
  district_name: string;
  elevation_m: number;
  model_version: string;
  generated_at: string;
  data_source: string;
  weather_cached: boolean;
  stale: boolean;
  downscaled: boolean;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  warnings: string[] | null;
  ndvi: NDVIData | null;
  ndvi_as_of: string | null;
  advisories: AdvisoryData[] | null;
}

// Legacy advisory type used by AdvisoryCard component
export interface Advisory {
  id: number;
  panchayat_id: number;
  panchayat_name: string;
  crop_name: string;
  growth_stage: string;
  title: string;
  title_hi?: string;
  description: string;
  description_hi?: string;
  recommended_action: string;
  recommended_action_hi?: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence_pct: number;
  weather_trigger: string;
  is_official: boolean;
  created_at: string;
}

export interface MLMetrics {
  version_name: string;
  algorithm: string;
  mae_temp_c: number;
  rmse_temp_c: number;
  r2_temp: number;
  rain_precision: number;
  rain_recall: number;
  status: string;
  trained_at: string;
}

export interface SystemHealth {
  status: string;
  database: string;
  active_model: string;
  demo_mode: boolean;
  ingestion_status: string;
  uptime_seconds: number;
  total_users: number;
  total_panchayats: number;
  active_alerts: number;
}
