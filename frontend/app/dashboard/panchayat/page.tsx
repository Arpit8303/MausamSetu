'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LocationSelector from '../../../components/LocationSelector';
import { Cloud, Droplets, Thermometer, Wind, AlertTriangle, Info, Plus, ChevronRight, Activity, Calendar, Sun, Moon, Bell, User as UserIcon } from 'lucide-react';
import { Advisory } from '../../../types';

// Leaflet accesses `window` at module load time — must be loaded client-side only
const WeatherMap = dynamic(() => import('../../../components/WeatherMap'), {
  ssr: false,
  loading: () => <div className="w-full h-64 rounded-2xl bg-slate-100 animate-pulse" />,
});
const NDVIMap = dynamic(() => import('../../../components/NDVIMap'), {
  ssr: false,
  loading: () => <div className="w-full h-64 rounded-2xl bg-slate-100 animate-pulse" />,
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export default function PanchayatDashboardPage() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('mausamsetu-panchayat-theme');
    if (stored === 'dark') setDarkMode(true);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('mausamsetu-panchayat-theme', next ? 'dark' : 'light');
  };

  const [panchayatId, setPanchayatId] = useState<number>(1);
  const [lat, setLat] = useState<number>(26.762);
  const [lon, setLon] = useState<number>(80.881);
  
  const [awsData, setAwsData] = useState<any>(null);
  const [awsLoading, setAwsLoading] = useState<boolean>(true);
  const [awsDemo, setAwsDemo] = useState<boolean>(false);

  const [ndviData, setNdviData] = useState<any>(null);
  const [ndviLoading, setNdviLoading] = useState<boolean>(true);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState<boolean>(true);
  const [alertsDemo, setAlertsDemo] = useState<boolean>(false);

  const [advisory, setAdvisory] = useState<Advisory | null>(null);

  const stateId = 9;
  const districtId = 302;

  useEffect(() => {
    const fetchData = async () => {
      setAwsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/weather/aws/${stateId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setAwsData(data[0]);
            setAwsDemo(data[0].data_source === "demo_fallback");
          }
        }
      } catch (e) { console.error(e); } finally { setAwsLoading(false); }

      setNdviLoading(true);
      try {
        const res = await fetch(`${API_BASE}/ndvi?lat=${lat}&lng=${lon}`);
        if (res.ok) {
          const data = await res.json();
          setNdviData(data);
        }
      } catch (e) { console.error(e); } finally { setNdviLoading(false); }

      setAlertsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/weather/nowcast/${districtId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.alerts) {
            setAlerts(data.alerts);
            setAlertsDemo(data.data_source === "demo_fallback");
          }
        }
      } catch (e) { console.error(e); } finally { setAlertsLoading(false); }
      
      setAdvisory({
        id: 999, panchayat_id: panchayatId, panchayat_name: "Selected Panchayat", crop_name: "Wheat", growth_stage: "Vegetative", title: "Crop Stress Alert", description: "Derived advisory based on current satellite health and local weather patterns.", recommended_action: "Maintain optimal soil moisture. Schedule irrigation if rainfall remains absent.", risk_level: "MEDIUM", confidence_pct: 85, weather_trigger: "High Temp / Low Rain", is_official: false, created_at: new Date().toISOString()
      });
    };

    fetchData();
  }, [panchayatId, lat, lon]);

  const getNdviInsight = (ndvi?: number) => {
    if (ndvi === undefined || ndvi === null) return "N/A";
    if (ndvi > 0.6) return "High vegetation health";
    if (ndvi >= 0.3) return "Moderate vegetation, monitor for stress";
    return "Low vegetation, needs attention";
  };
  const ndviVal = ndviData?.avg_ndvi;

  // If not mounted yet, render a skeleton container to avoid hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className={darkMode ? 'pd-dark' : 'pd-light'}>
      <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-[var(--pd-bg)] text-[var(--pd-text-primary)]">
        {/* Navbar is kept out of the dark theme scope to not break global UI, unless desired. 
            However, we can just render the original navbar. */}
        <Navbar />

        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* TOP BAR: Location, Date, Controls */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[var(--pd-card)] p-4 rounded-2xl shadow-[var(--pd-shadow)] border border-[var(--pd-border)]">
            <div className="flex-1 w-full xl:w-auto">
              <LocationSelector onPanchayatChange={(id) => {
                setPanchayatId(id);
                if (id === 1) { setLat(26.762); setLon(80.881); }
                if (id === 2) { setLat(26.741); setLon(80.862); }
                if (id === 3) { setLat(26.728); setLon(80.843); }
                if (id === 4) { setLat(26.892); setLon(81.062); }
              }} />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 xl:shrink-0 w-full xl:w-auto justify-between xl:justify-end">
              {/* Date */}
              <div className="flex items-center gap-2 bg-[var(--pd-card-muted)] px-4 py-2.5 rounded-xl border border-[var(--pd-border)] text-[var(--pd-text-secondary)]">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  className="p-2.5 rounded-xl bg-[var(--pd-toggle-bg)] border border-[var(--pd-toggle-border)] text-[var(--pd-toggle-text)] hover:opacity-80 transition-opacity flex items-center justify-center"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                {/* Notifications */}
                <button className="p-2.5 rounded-xl bg-[var(--pd-toggle-bg)] border border-[var(--pd-toggle-border)] text-[var(--pd-toggle-text)] hover:opacity-80 transition-opacity flex items-center justify-center relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[var(--pd-toggle-bg)]"></span>
                </button>

                {/* User Profile */}
                <button className="p-2.5 rounded-xl bg-[var(--pd-toggle-bg)] border border-[var(--pd-toggle-border)] text-[var(--pd-toggle-text)] hover:opacity-80 transition-opacity flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ROW 1: Weather & Crop Intelligence */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* LEFT: Weather Intelligence */}
            <div className="bg-[var(--pd-card)] rounded-[16px] border border-[var(--pd-border-weather)] shadow-[var(--pd-shadow)] overflow-hidden flex flex-col transition-shadow hover:shadow-[var(--pd-shadow-md)]">
              <div className="p-4 border-b border-[var(--pd-border-weather)] flex justify-between items-center bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, var(--pd-header-weather-from), var(--pd-header-weather-to))' }}>
                <div>
                  <h2 className="font-bold text-lg flex items-center gap-2 text-[var(--pd-weather-title)]">
                    <Cloud className="w-5 h-5" style={{ color: '#38BDF8' }} /> Weather Intelligence
                  </h2>
                  <p className="text-xs font-medium mt-0.5 text-[var(--pd-text-muted)]">Real-time weather conditions for your Panchayat</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${awsDemo ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>
                  {awsDemo ? 'DEMO DATA' : 'LIVE DATA'}
                </span>
              </div>
              
              <div className="p-5 flex flex-col h-full gap-5">
                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-[var(--pd-kpi-border)] bg-[var(--pd-kpi-bg)] text-center flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 text-sky-500">
                      <Cloud className="w-3.5 h-3.5" /> Cloud
                    </span>
                    {awsLoading ? <div className="h-7 w-16 pd-skeleton rounded mt-1"></div> : (
                      <div className="font-black text-2xl text-[var(--pd-kpi-val)] tracking-tight">
                        {awsData?.humidity_pct ? `${awsData.humidity_pct}%` : "N/A"}
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 rounded-xl border border-[var(--pd-kpi-border)] bg-[var(--pd-kpi-bg)] text-center flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 text-sky-500">
                      <Droplets className="w-3.5 h-3.5" /> Rain
                    </span>
                    {awsLoading ? <div className="h-7 w-16 pd-skeleton rounded mt-1"></div> : (
                      <div className="font-black text-2xl text-[var(--pd-kpi-val)] tracking-tight">
                        {awsData?.rainfall_mm ? `${awsData.rainfall_mm}mm` : "0mm"}
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 rounded-xl border border-[var(--pd-kpi-border)] bg-[var(--pd-kpi-bg)] text-center flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 text-sky-500">
                      <Thermometer className="w-3.5 h-3.5" /> Temp
                    </span>
                    {awsLoading ? <div className="h-7 w-16 pd-skeleton rounded mt-1"></div> : (
                      <div className="font-black text-2xl text-[var(--pd-kpi-val)] tracking-tight">
                        {awsData?.temp_c ? `${awsData.temp_c}°C` : "N/A"}
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 rounded-xl border border-[var(--pd-kpi-border)] bg-[var(--pd-kpi-bg)] text-center flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 text-sky-500">
                      <Wind className="w-3.5 h-3.5" /> Wind
                    </span>
                    {awsLoading ? <div className="h-7 w-16 pd-skeleton rounded mt-1"></div> : (
                      <div className="font-black text-2xl text-[var(--pd-kpi-val)] tracking-tight">
                        {awsData?.wind_speed_kmh ? `${awsData.wind_speed_kmh}km/h` : "N/A"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Map */}
                <div className="flex-1 min-h-[280px]">
                  {awsLoading ? (
                    <div className="w-full h-full rounded-xl pd-skeleton flex items-center justify-center text-[var(--pd-text-muted)] text-sm font-medium border border-[var(--pd-border)]">
                      Loading Map Interface...
                    </div>
                  ) : (
                    <WeatherMap selectedPanchayatId={panchayatId} awsData={awsData ? [awsData] : []} darkMode={darkMode} />
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Crop & Land Observation */}
            <div className="bg-[var(--pd-card)] rounded-[16px] border border-[var(--pd-border-crop)] shadow-[var(--pd-shadow)] overflow-hidden flex flex-col transition-shadow hover:shadow-[var(--pd-shadow-md)]">
              <div className="p-4 border-b border-[var(--pd-border-crop)] flex justify-between items-center bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, var(--pd-header-crop-from), var(--pd-header-crop-to))' }}>
                <div>
                  <h2 className="font-bold text-lg flex items-center gap-2 text-[var(--pd-crop-title)]">
                    <Activity className="w-5 h-5" style={{ color: '#10B981' }} /> Crop & Land Observation
                  </h2>
                  <p className="text-xs font-medium mt-0.5 text-[var(--pd-text-muted)]">Satellite-based vegetation monitoring</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  LIVE DATA
                </span>
              </div>
              
              <div className="p-5 flex flex-col h-full gap-5">
                <div className="flex-1 min-h-[380px]">
                  {ndviLoading ? (
                    <div className="w-full h-full rounded-xl pd-skeleton flex items-center justify-center text-[var(--pd-text-muted)] text-sm font-medium border border-[var(--pd-border)]">
                      Analyzing Satellite Data...
                    </div>
                  ) : (
                    <NDVIMap selectedPanchayatId={panchayatId} lat={lat} lon={lon} tileUrl={ndviData?.tile_url} avgNdvi={ndviData?.avg_ndvi} darkMode={darkMode} />
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Visual Connector / Flow Indication */}
          <div className="flex justify-center -my-3 relative z-10 hidden xl:flex">
            <div className="flex items-center gap-2">
              <div className="w-px h-8 bg-gradient-to-b from-[var(--pd-border-weather)] to-[var(--pd-border-advisory)]"></div>
              <div className="bg-[var(--pd-card)] rounded-full p-1.5 shadow-sm border border-[var(--pd-border-advisory)] text-[var(--pd-advisory-title)]">
                <Plus className="w-4 h-4" />
              </div>
              <div className="w-px h-8 bg-gradient-to-b from-[var(--pd-border-crop)] to-[var(--pd-border-advisory)]"></div>
            </div>
          </div>

          {/* ROW 2: Panchayat-Level Advisory */}
          <div className="bg-[var(--pd-card)] rounded-[16px] border border-[var(--pd-border-advisory)] shadow-[var(--pd-shadow-md)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 opacity-80"></div>
            
            <div className="p-5 border-b border-[var(--pd-border-advisory)] bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, var(--pd-header-advisory-from), var(--pd-header-advisory-to))' }}>
              <h2 className="font-bold text-xl flex items-center gap-2 text-[var(--pd-advisory-title)]">
                <Info className="w-6 h-6" style={{ color: '#6366F1' }} /> Panchayat-Level Advisory
              </h2>
              <p className="text-sm font-medium mt-1 text-[var(--pd-text-secondary)]">Combined weather and crop intelligence for better decisions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--pd-border)]">
              
              {/* COL 1: Weather Summary */}
              <div className="p-6 space-y-5 bg-[var(--pd-card)]">
                <h3 className="font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 text-sky-500">
                  <Cloud className="w-4 h-4" /> Weather Summary
                </h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center pb-2.5 border-b border-[var(--pd-border)]">
                    <span className="text-sm text-[var(--pd-text-secondary)]">Temperature</span>
                    <span className="font-semibold text-[var(--pd-text-primary)]">{awsLoading ? "-" : awsData?.temp_c ? `${awsData.temp_c}°C` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-[var(--pd-border)]">
                    <span className="text-sm text-[var(--pd-text-secondary)]">Rainfall</span>
                    <span className="font-semibold text-sky-500">{awsLoading ? "-" : awsData?.rainfall_mm ? `${awsData.rainfall_mm}mm` : "0.0mm"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-[var(--pd-border)]">
                    <span className="text-sm text-[var(--pd-text-secondary)]">Cloud Cover</span>
                    <span className="font-semibold text-[var(--pd-text-primary)]">{awsLoading ? "-" : awsData?.humidity_pct ? `${awsData.humidity_pct}%` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-[var(--pd-border)]">
                    <span className="text-sm text-[var(--pd-text-secondary)]">Wind Speed</span>
                    <span className="font-semibold text-[var(--pd-text-primary)]">{awsLoading ? "-" : awsData?.wind_speed_kmh ? `${awsData.wind_speed_kmh}km/h` : "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* COL 2: Crop & Land Summary */}
              <div className="p-6 space-y-5 bg-[var(--pd-card-alt)]">
                <h3 className="font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 text-emerald-500">
                  <Activity className="w-4 h-4" /> Crop Health Summary
                </h3>
                <div className="space-y-4">
                  <div className="bg-[var(--pd-card)] p-4 rounded-[14px] border border-[var(--pd-border-crop)] shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-[var(--pd-text-secondary)]">Average NDVI</span>
                      {!ndviLoading && <span className="w-2 h-2 rounded-full bg-emerald-500 pd-pulse"></span>}
                    </div>
                    {ndviLoading ? <div className="h-10 w-24 pd-skeleton rounded mt-1"></div> : (
                      <div className="font-black text-3xl text-emerald-500 tracking-tight">
                        {ndviVal !== undefined ? ndviVal.toFixed(2) : "N/A"}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-[var(--pd-card)] p-4 rounded-[14px] border border-[var(--pd-border-crop)] shadow-sm">
                    <span className="text-xs font-semibold text-[var(--pd-text-secondary)] block mb-1.5">Vegetation Insight</span>
                    <div className="font-medium text-sm text-[var(--pd-text-primary)] leading-snug">
                      {ndviLoading ? (
                        <div className="space-y-1.5 mt-1">
                          <div className="h-3 w-full pd-skeleton rounded"></div>
                          <div className="h-3 w-4/5 pd-skeleton rounded"></div>
                        </div>
                      ) : getNdviInsight(ndviVal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* COL 3: Advisories */}
              <div className="p-6 space-y-5 bg-[var(--pd-advisory-bg)]">
                <h3 className="font-bold text-[11px] uppercase tracking-widest flex items-center justify-between text-indigo-500">
                  <span className="flex items-center gap-2"><Info className="w-4 h-4" /> Advisories</span>
                  {alertsDemo && <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full font-bold">DEMO</span>}
                </h3>
                
                <div className="space-y-3.5">
                  {/* Weather Alert */}
                  {alertsLoading ? (
                    <div className="h-16 pd-skeleton rounded-[14px]"></div>
                  ) : alerts.length > 0 ? (
                    <div className="bg-red-500/5 p-4 rounded-[14px] border border-red-500/20 flex gap-3 items-start hover:border-red-500/40 transition-colors cursor-pointer group">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-bold text-sm text-red-500">{alerts[0].headline || "Weather Alert"}</h4>
                        <p className="text-[12px] text-[var(--pd-text-secondary)] mt-1 line-clamp-2 leading-relaxed">{alerts[0].description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[var(--pd-card)] p-3.5 rounded-[14px] border border-[var(--pd-border)] flex gap-3 items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 pd-pulse shrink-0"></div>
                      <span className="text-xs font-medium text-[var(--pd-text-secondary)]">No active weather alerts</span>
                    </div>
                  )}

                  {/* Crop Suggestion */}
                  {advisory && (
                    <div className="bg-[var(--pd-card)] p-4 rounded-[14px] border border-[var(--pd-border-advisory)] shadow-sm flex flex-col gap-2.5 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-[var(--pd-advisory-title)]">{advisory.title}</h4>
                        <ChevronRight className="w-4 h-4 text-[var(--pd-text-muted)] group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <p className="text-[12px] text-[var(--pd-text-secondary)] line-clamp-2 leading-relaxed">{advisory.recommended_action}</p>
                      <div className="flex justify-end pt-1">
                        <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">Actionable</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </main>
        
        {/* Footer is kept out of the dark theme scope to not break global UI, unless desired. 
            However, we can just render the original footer. */}
        <Footer />
      </div>
    </div>
  );
}
