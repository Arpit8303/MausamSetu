import {
  WeatherIntelligenceResponse,
  WeatherForecastResponse,
  MLMetrics,
  SystemHealth,
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
