'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import WeatherCharts from '../../../components/WeatherCharts';
import AdvisoryCard from '../../../components/AdvisoryCard';
import { fetchWeatherIntelligence, fetchPanchayatForecast, ApiError } from '../../../lib/api';
import {
  WeatherIntelligenceResponse,
  WeatherForecastResponse,
  Advisory,
  AdvisoryData,
} from '../../../types';
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Leaf,
  CloudRain,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  Database,
  Satellite,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Load NDVIMap only on client (it uses Leaflet which needs window)
const NDVIMap = dynamic(() => import('../../../components/NDVIMap'), { ssr: false });

// ── Types ──────────────────────────────────────────────────────────────────
type PageStatus = 'loading' | 'success' | 'error-not-found' | 'error-unavailable' | 'error-network';

// ── Helpers ────────────────────────────────────────────────────────────────
function DataStatusBadge({ intelligence }: { intelligence: WeatherIntelligenceResponse }) {
  const isLive = !intelligence.weather_cached && !intelligence.stale;
  const isStale = intelligence.stale;
  const isCached = intelligence.weather_cached && !intelligence.stale;

  if (isStale) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <WifiOff className="w-3 h-3" /> Stale data — upstream unavailable
      </span>
    );
  }
  if (isCached) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        <Database className="w-3 h-3" /> Cached weather data
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <Wifi className="w-3 h-3" /> Live weather data
    </span>
  );
}

// Convert backend AdvisoryData → legacy Advisory shape for AdvisoryCard
function toAdvisory(adv: AdvisoryData, panchayatId: number, panchayatName: string, idx: number): Advisory {
  return {
    id: idx + 1,
    panchayat_id: panchayatId,
    panchayat_name: panchayatName,
    crop_name: 'Wheat',
    growth_stage: 'Flowering Stage',
    ...adv,
    created_at: new Date().toISOString(),
  };
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PanchayatDetailPage({ params }: { params: { id: string } }) {
  const panchayatId = parseInt(params.id, 10);

  const [status, setStatus] = useState<PageStatus>('loading');
  const [intelligence, setIntelligence] = useState<WeatherIntelligenceResponse | null>(null);
  const [forecast, setForecast] = useState<WeatherForecastResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Cancel any in-flight request from a previous Panchayat
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setStatus('loading');
    setIntelligence(null);
    setForecast(null);

    if (!panchayatId || isNaN(panchayatId)) {
      setStatus('error-not-found');
      setErrorMessage('Invalid Panchayat ID in URL.');
      return;
    }

    try {
      // Fetch intelligence (weather + NDVI + advisories) and forecast in parallel.
      // Forecast is best-effort; if it fails, we still show intelligence data.
      const [intel, fc] = await Promise.allSettled([
        fetchWeatherIntelligence(panchayatId, ctrl.signal),
        fetchPanchayatForecast(panchayatId, ctrl.signal),
      ]);

      if (intel.status === 'rejected') {
        if ((intel.reason as any)?.name === 'AbortError') return; // cancelled — ignore
        const err = intel.reason as ApiError | Error;
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setStatus('error-not-found');
            setErrorMessage('Panchayat not found in the database.');
          } else if (err.status === 503) {
            setStatus('error-unavailable');
            setErrorMessage('Weather service is currently unavailable and no cached data exists.');
          } else {
            setStatus('error-unavailable');
            setErrorMessage(`Backend error: ${err.message}`);
          }
        } else {
          setStatus('error-network');
          setErrorMessage('Could not connect to the MausamSetu backend. Make sure the server is running.');
        }
        return;
      }

      setIntelligence(intel.value);
      if (fc.status === 'fulfilled') setForecast(fc.value);
      setStatus('success');
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setStatus('error-network');
      setErrorMessage('Network error. Please check your connection and retry.');
    }
  }, [panchayatId]);

  useEffect(() => {
    load();
    return () => { abortRef.current?.abort(); };
  }, [load]);

  // ── Loading State ──────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-slate-200 rounded-3xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72 bg-slate-200 rounded-2xl" />
              <div className="h-72 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Error States ────────────────────────────────────────────────────────
  if (status !== 'success' || !intelligence) {
    const icon = status === 'error-not-found'
      ? <MapPin className="w-12 h-12 text-slate-400" />
      : status === 'error-network'
      ? <WifiOff className="w-12 h-12 text-red-400" />
      : <AlertTriangle className="w-12 h-12 text-amber-400" />;

    const title = status === 'error-not-found'
      ? 'Panchayat Not Found'
      : status === 'error-network'
      ? 'Connection Error'
      : 'Service Unavailable';

    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
            <div className="flex justify-center">{icon}</div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{errorMessage}</p>
            {status !== 'error-not-found' && (
              <button
                onClick={load}
                className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Warnings Banner ─────────────────────────────────────────────────────
  const hasWarnings = intelligence.warnings && intelligence.warnings.length > 0;

  // ── Build advisory list for AdvisoryCard ───────────────────────────────
  const advisoryList: Advisory[] = (intelligence.advisories ?? []).map((adv, i) =>
    toAdvisory(adv, intelligence.panchayat_id, intelligence.panchayat_name, i)
  );

  // ── Forecast data for WeatherCharts ───────────────────────────────────
  const chartHourly = forecast?.hourly ?? [];
  const chartDaily = forecast?.daily ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Warnings Banner */}
        {hasWarnings && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Data Quality Notice</p>
              <ul className="mt-1 space-y-0.5">
                {intelligence.warnings!.map((w, i) => (
                  <li key={i} className="text-xs text-amber-700">{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Panchayat Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  Gram Panchayat ID: {intelligence.panchayat_id}
                </span>
                <DataStatusBadge intelligence={intelligence} />
                {intelligence.downscaled && (
                  <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold border border-violet-200">
                    ML Downscaled
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">{intelligence.panchayat_name}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Block: {intelligence.block_name} | District: {intelligence.district_name} | {intelligence.state_name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Data as of: {new Date(intelligence.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                &nbsp;|&nbsp; Source: {intelligence.data_source}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Confidence Score</span>
              <span className="text-2xl font-black text-emerald-600">
                {(intelligence.confidence_score * 100).toFixed(0)}%
              </span>
              <span className="block text-[11px] text-slate-400">±{intelligence.uncertainty_margin_c}°C</span>
            </div>
          </div>

          {/* Quick Weather Metrics — all from real backend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Temperature
              </div>
              <span className="text-lg font-bold text-slate-800">{intelligence.temp_c}°C</span>
              <span className="text-[11px] text-slate-500">
                Feels like {intelligence.feels_like_c}°C · Min {intelligence.temp_min_c}° / Max {intelligence.temp_max_c}°
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Droplets className="w-3.5 h-3.5 text-sky-500" /> Humidity
              </div>
              <span className="text-lg font-bold text-slate-800">{intelligence.humidity_pct}%</span>
              <span className="text-[11px] text-slate-500">Relative humidity</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" /> Precipitation
              </div>
              <span className="text-lg font-bold text-slate-800">{intelligence.precipitation_mm} mm</span>
              <span className="text-[11px] text-slate-500">{intelligence.precipitation_prob_pct}% probability</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Wind className="w-3.5 h-3.5 text-slate-500" /> Wind
              </div>
              <span className="text-lg font-bold text-slate-800">{intelligence.wind_speed_kmh} km/h</span>
              <span className="text-[11px] text-slate-500">Direction: {intelligence.wind_direction_deg}°</span>
            </div>
          </div>

          {/* Pressure Row */}
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              Pressure: <strong className="text-slate-700">{intelligence.pressure_hpa} hPa</strong>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Condition: <strong className="text-slate-700">{intelligence.weather_condition}</strong>
            </div>
            {intelligence.provider_source && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Satellite className="w-3.5 h-3.5 text-violet-400" />
                Provider: <strong className="text-slate-700">{intelligence.provider_source}</strong>
              </div>
            )}
            <button
              onClick={load}
              className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50"
              title="Refresh data"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* NDVI / Satellite Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-slate-800 text-base">Crop & Land Observation (NDVI)</h2>
            </div>
            {intelligence.ndvi ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Sentinel-2 · NDVI: {intelligence.ndvi.avg_ndvi.toFixed(3)}
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                NDVI unavailable
              </span>
            )}
          </div>

          {intelligence.ndvi ? (
            <div className="h-80">
              <NDVIMap
                lat={intelligence.latitude}
                lon={intelligence.longitude}
                tileUrl={intelligence.ndvi.tile_url}
                avgNdvi={intelligence.ndvi.avg_ndvi}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Satellite className="w-10 h-10 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-600 text-sm">NDVI data temporarily unavailable</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                The Google Earth Engine satellite service is currently unreachable. All other weather data is unaffected.
              </p>
            </div>
          )}
        </div>

        {/* Forecast Charts — only if forecast data loaded */}
        {chartHourly.length > 0 && chartDaily.length > 0 && (
          <div>
            <h2 className="font-bold text-slate-800 text-base mb-4">Forecast Charts</h2>
            <WeatherCharts hourly={chartHourly} daily={chartDaily} />
          </div>
        )}

        {/* Agricultural Advisories */}
        <div>
          <h2 className="font-bold text-lg text-slate-900 mb-4">Panchayat Microclimate Crop Advisories</h2>
          {advisoryList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advisoryList.map((adv) => (
                <AdvisoryCard key={adv.id} advisory={adv} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-medium text-sm text-slate-600">No active advisories</p>
              <p className="text-xs mt-1">Current weather conditions are within safe agricultural thresholds.</p>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
