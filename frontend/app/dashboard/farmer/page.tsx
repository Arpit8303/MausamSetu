'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import RightPanel from '../../../components/RightPanel';
import ForecastCards from '../../../components/ForecastCards';
import WeatherStats from '../../../components/WeatherStats';
import WeatherTimeline from '../../../components/WeatherTimeline';
import AdvisorySchedule from '../../../components/AdvisorySchedule';
import LocationSelector from '../../../components/LocationSelector';
import { fetchPanchayatForecast, fetchAdvisories } from '../../../lib/api';
import { WeatherForecastResponse, Advisory } from '../../../types';
import { Search, Bell, Sparkles, Navigation, CloudSun, User } from 'lucide-react';

export default function FarmerDashboard() {
  const [panchayatId, setPanchayatId] = useState<number>(1);
  const [crop, setCrop] = useState<string>('Wheat');
  const [forecast, setForecast] = useState<WeatherForecastResponse | null>(null);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchPanchayatForecast(panchayatId).then((fc) => setForecast(fc));
    fetchAdvisories(panchayatId, crop).then((adv) => setAdvisories(adv));
  }, [panchayatId, crop]);

  return (
    <DashboardLayout>
      {/* Workspace Top Header Bar: Heading, Search & Profile Drawer Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Weather Intelligence
            </h1>
            <p className="text-xs text-[#82918E] font-medium mt-1">
              Your Panchayat, Your Weather, Your Decisions
            </p>
          </div>

          {/* Search, Notifications & Profile Controls */}
          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
              <input
                type="text"
                placeholder="Search Panchayat, Block..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100/80 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#34B27B] placeholder:text-slate-400 font-medium"
              />
            </div>

            <button className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {/* Profile Avatar Toggle Button */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-1 rounded-full bg-[#EAF4EC] hover:bg-[#D8F18B] text-[#064E3B] transition-all border border-[#34B27B]/30 shadow-sm flex items-center gap-2 pl-1.5 pr-3 hover:scale-105"
              title="Open Profile & Quick Insights"
            >
              <div className="w-7 h-7 rounded-full bg-[#075E63] text-white flex items-center justify-center font-bold text-xs shadow">
                <User className="w-4 h-4 text-emerald-200" />
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">Profile</span>
            </button>
          </div>
        </div>

        {/* Location Dropdown Cascade */}
        <LocationSelector onPanchayatChange={(id) => setPanchayatId(id)} />

        {/* Top Forecast Cards & Statistics Section */}
        {forecast && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            
            {/* 3 Horizontal Forecast Cards (Today, Tomorrow, Day After) */}
            <div className="xl:col-span-8">
              <ForecastCards daily={forecast.daily} />
            </div>

            {/* Weather Statistics Radial Gauge */}
            <div className="xl:col-span-4">
              <WeatherStats
                confidenceScore={forecast.current.confidence_score}
                humidityPct={forecast.current.humidity_pct}
                precipProb={forecast.current.precipitation_prob_pct}
                tempAnomaly={forecast.current.uncertainty_margin_c ? `-${forecast.current.uncertainty_margin_c}°C` : '-0.6°C'}
              />
            </div>

          </div>
        )}

        {/* Lower Central Section: Timeline (Left) & Advisory Schedule (Right) */}
        {forecast && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Weather Timeline */}
            <div className="xl:col-span-7">
              <WeatherTimeline hourly={forecast.hourly} />
            </div>

            {/* Right: Upcoming Advisory Schedule */}
            <div className="xl:col-span-5">
              <AdvisorySchedule advisories={advisories} />
            </div>

          </div>
        )}

      {/* Collapsible Right Profile Drawer (Closed by Default) */}
      <RightPanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        panchayatName={forecast?.panchayat_name || 'Amausi Panchayat'}
        districtName={`${forecast?.district_name || 'Lucknow'}, Uttar Pradesh`}
        tempMax={forecast?.current.temp_max_c || 31.4}
        weatherCond={forecast?.current.weather_condition || 'Partly Cloudy'}
      />
    </DashboardLayout>
  );
}
