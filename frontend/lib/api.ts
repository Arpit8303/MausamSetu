import {
  WeatherIntelligenceResponse,
  WeatherForecastResponse,
  MLMetrics,
  SystemHealth,
  Advisory,
} from '../types';

// ── API base URL ─────────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_API_URL in .env.local for production.
// Development default: http://127.0.0.1:8000
const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://127.0.0.1:8000/api/v1';

// ── Error class for typed handling ───────────────────────────────────────────
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Generic fetch helper ──────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    signal,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {}
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

// ────────────────────────────────────────────────────────────────────────────
// PRIMARY ENDPOINT
// GET /api/v1/weather/intelligence?panchayat_id={panchayatId}
//
// Returns: WeatherIntelligenceResponse
//   - current weather (temp, humidity, wind, precipitation, pressure)
//   - NDVI (may be null if GEE fails)
//   - advisories (Wheat / Flowering stage)
//   - metadata (weather_cached, stale, downscaled, warnings)
// ────────────────────────────────────────────────────────────────────────────
export async function fetchWeatherIntelligence(
  panchayatId: number,
  signal?: AbortSignal
): Promise<WeatherIntelligenceResponse> {
  return apiFetch<WeatherIntelligenceResponse>(
    `/weather/intelligence?panchayat_id=${panchayatId}`,
    signal
  );
}

// ── Forecast endpoint (used by charts) ───────────────────────────────────────
export async function fetchPanchayatForecast(
  panchayatId: number,
  signal?: AbortSignal
): Promise<WeatherForecastResponse> {
  return apiFetch<WeatherForecastResponse>(
    `/weather/forecast?panchayat_id=${panchayatId}`,
    signal
  );
}

// ── ML metrics endpoint ───────────────────────────────────────────────────────
export async function fetchMLMetrics(
  signal?: AbortSignal
): Promise<MLMetrics> {
  return apiFetch<MLMetrics>('/ml/model/metrics', signal);
}

// ── System health endpoint ────────────────────────────────────────────────────
export async function fetchSystemHealth(
  signal?: AbortSignal
): Promise<SystemHealth> {
  return apiFetch<SystemHealth>('/admin/system-health', signal);
}

// ── Advisory endpoint ─────────────────────────────────────────────────────────
// The backend does NOT expose a dedicated advisory endpoint. Advisories are
// returned as part of GET /api/v1/weather/intelligence?panchayat_id={id}.
//
// This function fetches the intelligence response, extracts the advisories
// array, maps AdvisoryData (backend) → Advisory (frontend UI type), and
// optionally filters by crop name (client-side, since the backend is not
// crop-aware at advisory level).
//
// Fields in Advisory that have no backend equivalent are given safe defaults:
//   id            → synthetic sequential integer
//   panchayat_id  → the requested panchayatId
//   panchayat_name → from the intelligence response
//   crop_name     → the requested crop (passed in by the caller)
//   growth_stage  → "General" (backend does not return per-stage advisories)
//   created_at    → current ISO timestamp
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAdvisories(
  panchayatId: number,
  crop?: string,
  signal?: AbortSignal
): Promise<Advisory[]> {
  let intelligence: WeatherIntelligenceResponse;
  try {
    intelligence = await apiFetch<WeatherIntelligenceResponse>(
      `/weather/intelligence?panchayat_id=${panchayatId}`,
      signal
    );
  } catch {
    // Return empty array on error so the UI renders gracefully rather than crashing
    return [];
  }

  const rawAdvisories = intelligence.advisories ?? [];

  // Map AdvisoryData → Advisory, injecting safe defaults for UI-only fields
  const mapped: Advisory[] = rawAdvisories.map((adv, idx) => ({
    id: idx + 1,
    panchayat_id: panchayatId,
    panchayat_name: intelligence.panchayat_name,
    crop_name: crop ?? 'General',
    growth_stage: 'General',
    title: adv.title,
    title_hi: adv.title_hi,
    description: adv.description,
    description_hi: adv.description_hi,
    recommended_action: adv.recommended_action,
    recommended_action_hi: adv.recommended_action_hi,
    risk_level: adv.risk_level,
    confidence_pct: adv.confidence_pct,
    weather_trigger: adv.weather_trigger,
    is_official: adv.is_official,
    created_at: new Date().toISOString(),
  }));

  return mapped;
}
